"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import LiquidDistortion from "./LiquidDistortion";

const heroImages = [
  "/images/Cocktail Visualization.webp",
  "/images/Excellence 05.webp",
  "/images/Fendi 02.webp",
  "/images/Fendi 03.webp",
  "/images/Fendi 06.webp",
  "/images/Porsche Visualization 02.webp",
  "/images/Porsche Visualization 03.webp",
  "/images/Porsche Visualization 05.webp",
  "/images/Porsche Visualization 06.webp",
  "/images/Preza 06.webp",
  "/images/Valentino Green 02.webp",
  "/images/Valentino Green 03.webp",
  "/images/Valentino Green 04.webp"
];

/**
 * Aura crossfade strategy — eliminates black strobe flash.
 *
 *  State at rest:
 *    Layer A = current image, opacity 1 (always fully visible).
 *    Layer B = same image,    opacity 0 (invisible, sits on top via z-index 2).
 *
 *  On image change (fired by the WebGL canvas):
 *    1. Load new URL into Layer B while it is still invisible.
 *    2. Double-rAF: ensure browser paints opacity:0 first.
 *    3. Fade Layer B  0 → 1  over AURA_FADE_MS.
 *       Layer A stays at opacity:1 the entire time — no gap, no black flash.
 *    4. After AURA_FADE_MS + buffer: snap Layer A to the new image,
 *       instantly reset Layer B to opacity:0 (transition:"none").
 *       Because Layer A now shows the correct image, the snap is invisible.
 *
 *  Result: the combined rendered pixels are always fully opaque —
 *  the dark background can never show through the mask at any point.
 */
const AURA_FADE_MS = 3000;

type AuraStyle = React.CSSProperties & { "--aura-speed": string };

export default function HeroSection() {
  const [layerA, setLayerA] = useState(heroImages[0]);
  const [layerB, setLayerB] = useState(heroImages[0]);
  const [layerBOpacity, setLayerBOpacity] = useState(0);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel pending swap timer on unmount to avoid setState-after-unmount
  useEffect(() => {
    return () => {
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  const handleImageChange = useCallback((url: string) => {
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);

    // 1. Load incoming image into the invisible Layer B
    setLayerB(url);

    // 2. Double-rAF: browser must paint opacity:0 before we switch to 1
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLayerBOpacity(1); // CSS transition fires: 0 → 1
      });
    });

    // 3. After fade completes, silently promote Layer A and reset Layer B
    swapTimerRef.current = setTimeout(() => {
      setLayerA(url);       // A shows the new image (was already showing via B)
      setLayerBOpacity(0);  // B snaps to 0 instantly (transition:"none")
      setLayerB(url);       // keep B in sync for the next round
    }, AURA_FADE_MS + 80);  // tiny buffer past the transition end
  }, []);

  const maskStyle: React.CSSProperties = {
    maskImage: "url('/mask.svg')",
    maskSize: "cover",
    maskPosition: "bottom center",
    maskRepeat: "no-repeat",
    WebkitMaskImage: "url('/mask.svg')",
    WebkitMaskSize: "cover",
    WebkitMaskPosition: "bottom center",
    WebkitMaskRepeat: "no-repeat",
  };

  /* ---- AMBIENT AURA SETTINGS ---- */
  const auraBlur = "180px";
  const auraOpacity = 0.8;
  const auraSaturate = "saturate(2.5)";
  const auraBrightness = "brightness(1.5)";
  const auraSpeed = "4s";

  const layerAStyle: AuraStyle = {
    backgroundImage: `url('${layerA}')`,
    opacity: 1,
    zIndex: 1,
    transition: "none",
    "--aura-speed": auraSpeed,
  };

  const layerBStyle: AuraStyle = {
    backgroundImage: `url('${layerB}')`,
    opacity: layerBOpacity,
    // Transition only when fading IN. The snap-reset back to 0 must be instant
    // (invisible because Layer A already shows the correct image at that point).
    transition: layerBOpacity === 1
      ? `opacity ${AURA_FADE_MS}ms ease-in-out`
      : "none",
    zIndex: 2,
    "--aura-speed": auraSpeed,
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{ height: "var(--fluid-hero-h, 62vh)" }}
    >
      {/* ── Ambient Aura — sits behind WebGL canvas (zIndex 0 < canvas zIndex 1) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: `blur(${auraBlur}) ${auraSaturate} ${auraBrightness}`,
          opacity: auraOpacity,
          transform: "scale(1.02)",
          transformOrigin: "bottom center",
          zIndex: 0,
        }}
      >
        {/* Mask — keeps the shape perfectly stationary */}
        <div className="w-full h-full overflow-hidden relative" style={maskStyle}>

          {/* Layer A: always opacity 1, shows the current image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-aura-flow"
            style={{ ...layerAStyle, willChange: "opacity" }}
          />

          {/* Layer B: fades in (0→1) then snaps back to 0 invisibly */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-aura-flow"
            style={{ ...layerBStyle, willChange: "opacity" }}
          />

        </div>
      </div>

      {/* ── Main Interactive WebGL Mask ─────────────────────────────────── */}
      <LiquidDistortion
        imageUrls={heroImages}
        transitionInterval={4000}
        onImageChange={handleImageChange}
        className="absolute inset-0"
        maskStyle={maskStyle}
        hitPathD="M2490.3 851.443L2159.01 1203.51C2014.81 1356.75 1934.52 1559.24 1934.52 1769.67V2337.84C1934.52 2474.58 1894.79 2608.44 1820.16 2723.07L1509.8 3199.79C1420.69 3336.67 1268.42 3419.24 1105.09 3419.24H697.472C1178.45 3269.56 1527.64 2820.9 1527.64 2290.67C1527.64 2211.43 1519.84 2133.98 1504.94 2059.11L1624.72 2260.79C1651.64 2306.16 1721.2 2287.04 1721.2 2234.32V1036.38C1721.2 972.177 1669.14 920.152 1604.94 920.152H402.32C349.523 920.152 330.48 989.847 375.972 1016.7L567.159 1129.57C495.491 1115.96 421.492 1108.85 345.863 1108.85C-306.816 1108.85 -835.902 1637.97 -835.902 2290.66C-835.902 2709.75 -617.766 3077.88 -288.788 3287.71C-669.362 3106.58 -955.993 2752.67 -1035.74 2316.25C-1193.64 1452.5 -534.517 699.971 300.415 699.971H2424.85C2503.59 699.971 2544.27 794.071 2490.28 851.428L2490.3 851.443Z"
        hitPathViewBox="0 0 1920 1080"
        showGlassCursor={true}
        cursorRadius={0.3}
        distortionStrength={0.01}
        glowRadius="600px"
        glowColor="rgba(255, 255, 255, 0.4)"
        glowSpread="40%"
      />
    </div>
  );
}
