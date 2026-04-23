"use client";

// Animated tagline — "[CyclingWord]. Reimagined."
// Top word cycles every 2 s with a 400 ms opacity fade.
// "Reimagined." row stays as the original SVG paths — no visual change.

import { useEffect, useRef, useState } from "react";

const DEFAULT_WORDS = ["Reality", "Brands", "Visuals", "Stories", "Culture"];
const INTERVAL_MS = 2000;
const FADE_MS = 400;

export default function TaglineLeft({
  className,
  style,
  // Edit words here in page.tsx — or pass any array of strings.
  words = DEFAULT_WORDS,
  // Nudge the cycling word independently of the SVG row below.
  // Positive wordOffsetY moves it down (px); negative moves it up.
  wordOffsetX = 0,
  wordOffsetY = 0,
  wordScale = 0.8,
  scale = 1.8,
  offsetX = -5,
  offsetY = -1.5,
  transformOrigin = "right top",
}: {
  className?: string;
  style?: React.CSSProperties;
  words?: string[];
  wordOffsetX?: number;
  wordOffsetY?: number;
  wordScale?: number;
  scale?: number | string;
  offsetX?: number | string;
  offsetY?: number | string;
  transformOrigin?: string;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const swapRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out
      setVisible(false);
      // Cancel any in-flight swap from a previous tick
      if (swapRef.current) clearTimeout(swapRef.current);
      swapRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        // Fade in
        setVisible(true);
        swapRef.current = null;
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timer);
      // Also cancel any pending swap so we don't mutate state after unmount
      if (swapRef.current) clearTimeout(swapRef.current);
    };
  }, [words]); // restart when words array changes

  return (
    // Wrapper preserves the same aspect ratio as the original 141×54 SVG.
    // The `className` prop controls responsive height exactly as before.
    <div
      className={`${className || "w-auto h-[44px] md:h-[60px] lg:h-[72px]"} relative flex flex-col cursor-default`}
      style={{
        aspectRatio: "141 / 54",
        containerType: "size",
        transform: `scale(var(--nc-tagline-scale, ${scale})) translate(calc(var(--nc-tagline-x, ${offsetX}) * 1px), calc(var(--nc-tagline-y, ${offsetY}) * 1px))`,
        transformOrigin: transformOrigin,
        ...style,
      }}
    >
      {/* ── Row 1: cycling word ─────────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[50%]">
        <span
          aria-live="polite"
          style={{
            display: "block",
            position: "absolute",
            bottom: "0",
            left: "0",
            transform: `translate(${wordOffsetX}px, ${wordOffsetY}px) scale(${wordScale})`,
            transformOrigin: "bottom left",
            fontFamily: 'var(--font-helvetica-neue), "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 300,
            fontSize: "11px", // Stable, non-fluid baseline for total manual control
            lineHeight: 1.2,
            letterSpacing: "-0.00em",
            color: "#ffffff",
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
            whiteSpace: "nowrap",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {words[index]},
        </span>
      </div>

      {/* ── Row 2: "Reimagined." — original SVG paths, unchanged ── */}
      <div className="absolute bottom-0 left-0 w-full h-[50%]">
        <svg
          viewBox="0 0 141 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flicker-svg w-full h-full"
          style={{ display: "block" }}
        >
          {/* Paths originally at y ≈ 26–47 in the 0 0 141 54 viewBox.
            Translated down by -26 so they start at y=0 in this 0 0 141 28 viewport. */}
          <g transform="translate(0, -26)">
            <path d="M9.99734 26.0669C14.228 26.0669 16.6724 28.2504 16.6724 32.0249C16.6724 34.5203 15.7637 35.8928 13.5072 36.7662C15.7323 37.3277 16.1709 38.4195 16.2652 42.4747C16.2652 45.0637 16.3592 45.1573 17.3619 46.4986V46.873H13.9148C13.6325 45.75 13.5072 44.783 13.5072 43.3169C13.4132 38.7314 12.755 37.9828 9.05722 37.9828H2.75803V46.873H0V26.0669H9.99734ZM12.5044 34.8635C13.3506 34.2084 13.8204 33.179 13.8204 32.0249C13.8204 30.6835 13.1626 29.5605 12.1282 28.9678C11.4073 28.5935 10.6868 28.4688 9.40181 28.4688H2.82068V35.5809H9.40181C10.8435 35.5809 11.8776 35.3313 12.5044 34.8635Z" fill="white" />
            <path d="M30.1821 45.4381C29.0854 46.717 27.2361 47.4345 25.0113 47.4345C20.655 47.4345 17.9286 44.4087 17.9286 39.5113C17.9286 37.0159 18.4612 35.2378 19.5583 33.7717C20.843 32.0249 22.7549 31.1202 25.0113 31.1202C27.6124 31.1202 29.5866 32.2432 30.7463 34.3643C31.4672 35.7057 31.8431 37.203 31.8431 38.7939V40.0104H20.7177C20.8116 41.6013 21.0626 42.5371 21.6894 43.4105C22.4099 44.5023 23.695 45.1261 25.1053 45.1261C26.3274 45.1261 27.3931 44.7206 28.0196 43.8784C28.4899 43.4105 28.6152 42.9114 28.8658 41.9132H31.6864C31.5925 43.2545 31.0909 44.4087 30.1821 45.4381ZM24.9174 33.4286C22.5043 33.4286 20.9373 35.1754 20.7177 37.9204H29.0854C28.9601 35.1754 27.3305 33.4286 24.9174 33.4286Z" fill="white" />
            <path d="M35.8601 26.0669V28.9678H33.3217V26.0669H35.8601ZM35.8601 31.6505V46.873H33.3217V31.6505H35.8601Z" fill="white" />
            <path d="M40.3196 31.6506V33.5845C40.9148 32.8671 41.0401 32.6176 41.3224 32.368C42.1058 31.6194 43.2966 31.1514 44.6443 31.1514C46.5558 31.1514 47.9975 31.9936 48.9063 33.647C49.5644 32.8671 49.8464 32.6176 50.2539 32.2744C51.1627 31.5258 52.2595 31.1514 53.5445 31.1514C56.5531 31.1514 58.3707 32.9295 58.3707 35.7681V46.873H55.8323V36.5479C55.8323 34.5515 54.7982 33.4286 53.043 33.4286C50.7868 33.4286 49.2825 35.2066 49.2825 38.0764V46.873H46.7441V36.5479C46.7441 34.5515 45.741 33.4598 43.9547 33.4598C41.7296 33.4598 40.2566 35.3314 40.2566 38.0764V46.873H37.7182V31.6506H40.3196Z" fill="white" />
            <path d="M72.3001 47.0913C70.7018 47.0913 70.075 46.3114 69.981 44.6582C69.1349 45.7499 68.6959 46.1555 68.0381 46.561C67.129 47.0601 65.9069 47.3408 64.7475 47.3408C61.6449 47.3408 59.7017 45.6252 59.7017 42.8802C59.7017 41.0086 60.6418 39.4801 62.1775 38.7626C62.961 38.4195 63.7131 38.2635 66.5651 37.858C69.4168 37.5149 69.8244 37.203 69.8244 36.08C69.8244 34.3019 68.696 33.4286 66.4398 33.4286C64.058 33.4286 62.9296 34.3019 62.7104 36.2671H60.0153C60.2659 33.023 62.6477 31.1826 66.5651 31.1826C70.2003 31.1826 72.3628 32.8671 72.3628 35.6121V43.7536C72.3628 44.7206 72.676 45.0325 73.3969 45.0325C73.6165 45.0325 73.7418 45.0325 74.1177 44.9389V46.9665C73.0209 47.0601 72.7703 47.0913 72.3001 47.0913ZM65.9696 40.0104C63.4312 40.3847 62.3658 41.1958 62.3658 42.7866C62.3658 44.3151 63.3999 45.2197 65.2488 45.2197C66.5964 45.2197 67.7872 44.7206 68.8216 43.7536C69.5421 43.005 69.7617 42.5682 69.7617 41.6636V39.1681C68.5393 39.5736 67.9755 39.7608 65.9696 40.0104Z" fill="white" />
            <path d="M78.2697 50.3667C78.8652 50.8346 79.8367 51.1153 80.9334 51.1153C83.5658 51.1153 84.8822 49.7116 84.8822 46.9042V44.8454C83.6601 46.3427 82.4377 46.9665 80.6515 46.9665C76.7654 46.9665 74.227 43.7536 74.227 38.7626C74.227 34.0213 76.6088 31.0891 80.5888 31.0891C82.563 31.0891 83.6601 31.7129 84.8822 33.3661V31.6506H87.4832V46.8106C87.4832 47.996 87.2953 48.9629 86.9507 49.7427C85.9789 51.8639 83.6288 53.1428 80.6515 53.1428C78.489 53.1428 76.5774 52.3943 75.4804 51.0217C74.9478 50.3042 74.7909 49.8052 74.6969 48.6822H77.4862C77.6115 49.5868 77.7995 49.9924 78.2697 50.3667ZM76.9847 39.1681C76.9847 42.6307 78.5203 44.7518 81.0587 44.7518C82.4691 44.7518 83.7228 43.9719 84.318 42.7242C84.7882 41.7572 85.0701 40.3535 85.0701 39.0122C85.0701 35.425 83.5658 33.3038 81.0587 33.3038C78.4263 33.3038 76.9847 35.3937 76.9847 39.1681Z" fill="white" />
            <path d="M91.9456 26.0669V28.9678H89.4072V26.0669H91.9456ZM91.9456 31.6505V46.873H89.4072V31.6505H91.9456Z" fill="white" />
            <path d="M97.69 32.3056C98.5361 31.6506 99.7268 31.2451 101.075 31.2451C103.08 31.2451 104.741 32.0561 105.524 33.3973C105.932 34.1148 106.12 35.0195 106.12 36.0489V46.873H103.582V36.9846C103.582 34.7387 102.454 33.5533 100.416 33.5533C97.9406 33.5533 96.3423 35.3314 96.3423 38.0764V46.873H93.8039V31.6506H96.3736V33.647C97.0945 32.8047 97.3451 32.5863 97.69 32.3056Z" fill="white" />
            <path d="M119.711 45.4381C118.614 46.717 116.765 47.4345 114.54 47.4345C110.184 47.4345 107.458 44.4087 107.458 39.5113C107.458 37.0159 107.99 35.2378 109.087 33.7717C110.372 32.0249 112.284 31.1202 114.54 31.1202C117.141 31.1202 119.116 32.2432 120.275 34.3643C120.996 35.7057 121.372 37.203 121.372 38.7939V40.0104H110.247C110.341 41.6013 110.592 42.5371 111.218 43.4105C111.939 44.5023 113.224 45.1261 114.634 45.1261C115.857 45.1261 116.922 44.7206 117.549 43.8784C118.019 43.4105 118.144 42.9114 118.395 41.9132H121.215C121.121 43.2545 120.62 44.4087 119.711 45.4381ZM114.446 33.4286C112.033 33.4286 110.466 35.1754 110.247 37.9204H118.614C118.489 35.1754 116.859 33.4286 114.446 33.4286Z" fill="white" />
            <path d="M133.224 46.873V45.1261C132.002 46.8418 130.842 47.4033 128.837 47.4033C124.825 47.4033 122.381 44.3775 122.381 39.4801C122.381 36.7039 122.851 34.8323 123.948 33.3661C125.076 31.8689 126.799 31.0579 128.837 31.0579C130.748 31.0579 132.033 31.6817 133.318 33.2102V26.0669H135.857V46.873H133.224ZM125.138 39.1058C125.138 43.005 126.643 45.1886 129.275 45.1886C131.877 45.1886 133.412 42.9426 133.412 39.2929C133.412 37.5461 133.005 35.8617 132.378 34.8946C131.751 33.9276 130.498 33.2726 129.275 33.2726C126.674 33.2726 125.138 35.4873 125.138 39.1058Z" fill="white" />
            <path d="M140.507 43.8472V46.873H137.592V43.8472H140.507Z" fill="white" />
          </g>
        </svg>
      </div>
    </div>
  );
}
