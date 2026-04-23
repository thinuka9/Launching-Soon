"use client";

import { useEffect, useRef } from "react";
import { Renderer, Vec2, Geometry, Texture, Program, Mesh, Flowmap } from "ogl";

const _size = [2048, 1638]; // fallback natural size

export interface LiquidDistortionProps {
  /** The path to the image to distort. Fallback if imageUrls is empty. */
  imageUrl?: string;
  /** An array of image URLs to cycle through */
  imageUrls?: string[];
  /** How long to hold each image before transitioning (in ms) */
  transitionInterval?: number;
  /** Callback fired when the active image changes */
  onImageChange?: (url: string) => void;
  /** Wrapper class name */
  className?: string;
  /** CSS properties for masking (e.g., maskImage, maskSize) */
  maskStyle?: React.CSSProperties;
  /** Optional SVG path d="..." to constrain hit testing */
  hitPathD?: string;
  /** ViewBox for the hit path if hitPathD is provided */
  hitPathViewBox?: string;
  /** Whether to show a custom glassmorphism cursor inside the interactive area */
  showGlassCursor?: boolean;
  /** Controls the radius/feathering of the liquid distortion cursor (default 0.11) */
  cursorRadius?: number;
  /** Strength of the liquid distortion pull (default 0.01) */
  distortionStrength?: number;
  /** Radius of the hover glow effect (e.g., '600px') */
  glowRadius?: string;
  /** Color of the hover glow effect (e.g., 'rgba(255,255,255,0.15)') */
  glowColor?: string;
  /** Spread/stop of the hover glow effect (e.g., '40%') */
  glowSpread?: string;
}

export default function LiquidDistortion({
  imageUrl = "",
  imageUrls = [],
  transitionInterval = 5000,
  onImageChange,
  className = "",
  maskStyle = {},
  hitPathD,
  hitPathViewBox = "0 0 1920 1080",
  showGlassCursor = false,
  cursorRadius = 0.11,
  distortionStrength = 0.01,
  glowRadius = "600px",
  glowColor = "rgba(255,255,255,0.15)",
  glowSpread = "40%",
}: LiquidDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hitPathRef = useRef<SVGPathElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // ── Stable refs for all props that the effect reads ──────────────────────
  // This lets the effect mount exactly once (no WebGL teardown/rebuild on
  // every render) while always having access to the latest prop values.
  const onImageChangeRef = useRef(onImageChange);
  const glowRadiusRef    = useRef(glowRadius);
  const glowColorRef     = useRef(glowColor);
  const glowSpreadRef    = useRef(glowSpread);
  const showGlassCursorRef = useRef(showGlassCursor);

  useEffect(() => { onImageChangeRef.current = onImageChange; }, [onImageChange]);
  useEffect(() => { glowRadiusRef.current    = glowRadius;    }, [glowRadius]);
  useEffect(() => { glowColorRef.current     = glowColor;     }, [glowColor]);
  useEffect(() => { glowSpreadRef.current    = glowSpread;    }, [glowSpread]);
  useEffect(() => { showGlassCursorRef.current = showGlassCursor; }, [showGlassCursor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const imagesList = imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    if (imagesList.length === 0) return;

    // ── OGL renderer ─────────────────────────────────────────────────────
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    const gl = renderer.gl;

    gl.canvas.style.position     = "absolute";
    gl.canvas.style.top          = "0";
    gl.canvas.style.left         = "0";
    gl.canvas.style.width        = "100%";
    gl.canvas.style.height       = "100%";
    gl.canvas.style.display      = "block"; // prevent inline gap
    gl.canvas.style.zIndex       = "1";
    // pointer-events are handled by the hitPath SVG overlay or container itself
    gl.canvas.style.pointerEvents = "none";

    container.appendChild(gl.canvas);

    let aspect = 1;
    const mouse         = new Vec2(-1);
    const velocity      = new Vec2();
    let velocityNeedsUpdate = false;

    const flowmap = new Flowmap(gl, {
      falloff:      cursorRadius,
      dissipation:  0.94,
      alpha:        0.5,
    });

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv:       { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    // Create textures with a 1x1 transparent pixel placeholder to avoid sampling errors before images load
    const t1 = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      image: new Uint8Array([0, 0, 0, 0]),
      width: 1,
      height: 1,
    });
    const t2 = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      image: new Uint8Array([0, 0, 0, 0]),
      width: 1,
      height: 1,
    });

    const program = new Program(gl, {
      vertex: `
        attribute vec2 uv;
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0, 1);
        }
      `,
      fragment: `
        precision highp float;
        precision highp int;
        uniform sampler2D tWater1;
        uniform sampler2D tWater2;
        uniform sampler2D tFlow;
        uniform float uTransition;
        uniform float uDistortionStrength;
        varying vec2 vUv;
        uniform vec2 uAspect1;
        uniform vec2 uAspect2;
        void main() {
          vec3 flow = texture2D(tFlow, vUv).rgb;

          vec2 uv1   = (vUv - 0.5) * uAspect1 + 0.5;
          vec2 myUV1 = uv1 - flow.xy * uDistortionStrength;
          vec3 tex1  = texture2D(tWater1, myUV1).rgb;

          vec2 uv2   = (vUv - 0.5) * uAspect2 + 0.5;
          vec2 myUV2 = uv2 - flow.xy * uDistortionStrength;
          vec3 tex2  = texture2D(tWater2, myUV2).rgb;

          // Buttery smooth crossfade
          vec3 tex = mix(tex1, tex2, smoothstep(0.0, 1.0, uTransition));
          gl_FragColor = vec4(tex, 1.0);
        }
      `,
      uniforms: {
        uTime:               { value: 0 },
        uDistortionStrength: { value: distortionStrength },
        tWater1:             { value: t1 },
        tWater2:             { value: t2 },
        uTransition:         { value: 0 },
        uAspect1:            { value: [1.0, 1.0] },
        uAspect2:            { value: [1.0, 1.0] },
        tFlow:               flowmap.uniform,
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // ── Transition state ─────────────────────────────────────────────────
    let currentIndex      = 0;
    let nextImageIndex    = 0;
    let transitionProgress = 0;
    let isTransitioning   = false;
    let transitionStartTime = 0;
    let transitionTimer: ReturnType<typeof setInterval> | undefined;

    // ── Lazy Image Loading ──────────────────────────────────────────────
    // Instead of preloading all 13 images immediately, we preload the first 2
    // and then load the rest only when we are about to transition to them.
    const preloadedImages: (HTMLImageElement | undefined)[] = [];
    
    async function getOrLoadImage(index: number): Promise<HTMLImageElement> {
      if (preloadedImages[index]) return preloadedImages[index]!;
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imagesList[index];
        img.onload = () => {
          preloadedImages[index] = img;
          resolve(img);
        };
        img.onerror = () => {
          console.warn(`[LiquidDistortion] Failed to load: ${imagesList[index]}`);
          reject();
        };
      });
    }

    // Preload the first two images to have them ready for the first transition
    getOrLoadImage(0).then(() => initTexture());
    if (imagesList.length > 1) {
      getOrLoadImage(1);
    }

    // ── Helper: calculate cover-fit aspect correction ─────────────────────
    function calcAspect(imgW: number, imgH: number, canvasW: number, canvasH: number): [number, number] {
      if (!imgW || !imgH || !canvasW || !canvasH) return [1.0, 1.0];
      const imageAspect  = imgW / imgH;
      const canvasAspect = canvasW / canvasH;
      if (canvasAspect > imageAspect) {
        return [1.0, imageAspect / canvasAspect];
      } else {
        return [canvasAspect / imageAspect, 1.0];
      }
    }

    // ── Resize ───────────────────────────────────────────────────────────
    let resizeFrame: number | undefined;
    function resize() {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const width = rect.width || container.clientWidth;
        const height = rect.height || container.clientHeight;
        
        if (width <= 0 || height <= 0) return;

        renderer.setSize(width, height);
        aspect = width / height;

        const activeImg = preloadedImages[currentIndex];
        const nextImg   = preloadedImages[nextImageIndex] ?? activeImg;

        if (activeImg && activeImg.naturalWidth) {
          const [a1x, a1y] = calcAspect(activeImg.naturalWidth, activeImg.naturalHeight, width, height);
          mesh.program.uniforms.uAspect1.value = [a1x, a1y];
        }

        if (nextImg && nextImg.naturalWidth) {
          const [a2x, a2y] = calcAspect(nextImg.naturalWidth, nextImg.naturalHeight, width, height);
          mesh.program.uniforms.uAspect2.value = [a2x, a2y];
        }
      });
    }

    // ── Init first texture ───────────────────────────────────────────────
    async function initTexture() {
      const activeImg = await getOrLoadImage(0);
      if (!activeImg) return;

      t1.image = activeImg;
      t1.needsUpdate = true;
      resize();
      onImageChangeRef.current?.(imagesList[0]);
      if (imagesList.length > 1 && !transitionTimer) {
        transitionTimer = setInterval(startNextTransition, transitionInterval);
      }
    }

    // ── Start next image transition ───────────────────────────────────────
    async function startNextTransition() {
      if (isTransitioning) return;

      // Pick a random image different from the current one
      let next = Math.floor(Math.random() * imagesList.length);
      if (next === currentIndex) {
        next = (currentIndex + 1) % imagesList.length;
      }
      nextImageIndex = next;

      try {
        const nextImg = await getOrLoadImage(nextImageIndex);
        
        t2.image = nextImg;
        t2.needsUpdate = true;
        resize(); // recalculate uAspect2 for the incoming image
        isTransitioning     = true;
        transitionProgress  = 0;
        transitionStartTime = performance.now();
        onImageChangeRef.current?.(imagesList[nextImageIndex]);
      } catch (e) {
        console.error("[LiquidDistortion] Transition failed", e);
      }
    }

    initTexture();

    window.addEventListener("resize", resize, { passive: true });
    // Defer first resize until the container has laid out
    requestAnimationFrame(resize);

    // ── Pointer events ───────────────────────────────────────────────────
    const isTouchCapable = "ontouchstart" in window;
    // Capture the hit target reference at setup time for stable cleanup
    const hitTarget: Element | null = hitPathRef.current ?? container;

    function showCursor() {
      if (isTouchCapable) return;
      if (showGlassCursorRef.current && cursorRef.current) {
        cursorRef.current.style.opacity = "1";
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = "1";
      }
    }

    function updateMouse(e: MouseEvent | TouchEvent) {
      if (e.type.startsWith("touch")) e.preventDefault();

      let clientX: number, clientY: number;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        const me = e as MouseEvent;
        clientX = me.clientX;
        clientY = me.clientY;
      }

      // Move glass cursor
      if (showGlassCursorRef.current && cursorRef.current && !isTouchCapable) {
        cursorRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
        if (cursorRef.current.style.opacity === "0") {
          cursorRef.current.style.opacity = "1";
        }
      }

      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Update glow
      if (glowRef.current && !isTouchCapable) {
        const gr = glowRadiusRef.current;
        const gc = glowColorRef.current;
        const gs = glowSpreadRef.current;
        glowRef.current.style.background = `radial-gradient(${gr} circle at ${x}px ${y}px, ${gc}, transparent ${gs})`;
        if (glowRef.current.style.opacity === "0") {
          glowRef.current.style.opacity = "1";
        }
      }

      mouse.set(x / rect.width, 1.0 - y / rect.height);

      if (!lastTime) {
        lastTime = performance.now();
        lastMouse.set(x, y);
      }

      const deltaX = x - lastMouse.x;
      const deltaY = y - lastMouse.y;
      lastMouse.set(x, y);

      const now   = performance.now();
      const delta = Math.max(10.4, now - lastTime);
      lastTime    = now;

      velocity.x = deltaX / delta;
      velocity.y = deltaY / delta;
      velocityNeedsUpdate = true;
    }

    function resetMouse() {
      velocityNeedsUpdate = false;
      lastTime = undefined;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      if (glowRef.current)   glowRef.current.style.opacity   = "0";
    }

    let lastTime: number | undefined;
    const lastMouse = new Vec2();

    if (hitTarget) {
      if (isTouchCapable) {
        hitTarget.addEventListener("touchstart",  updateMouse as EventListener, { passive: false });
        hitTarget.addEventListener("touchmove",   updateMouse as EventListener, { passive: false });
        hitTarget.addEventListener("touchend",    resetMouse  as EventListener, { passive: true });
      } else {
        hitTarget.addEventListener("mousemove",   updateMouse as EventListener, { passive: true });
        hitTarget.addEventListener("mouseleave",  resetMouse  as EventListener, { passive: true });
        hitTarget.addEventListener("mouseenter",  showCursor,                   { passive: true });
      }
    }

    // ── Render loop ───────────────────────────────────────────────────────
    let animationFrameId: number;

    function update(t: number) {
      animationFrameId = requestAnimationFrame(update);

      if (isTransitioning) {
        const elapsed = t - transitionStartTime;
        // 3-second crossfade
        transitionProgress = Math.min(elapsed / 3000, 1.0);
        program.uniforms.uTransition.value = transitionProgress;

        if (transitionProgress >= 1.0) {
          isTransitioning = false;
          currentIndex    = nextImageIndex;

          // Promote t2 image into t1 so uAspect1 === uAspect2 after the swap
          t1.image = preloadedImages[currentIndex];
          t1.needsUpdate = true;

          // Copy aspect as a new array (avoid shared reference mutation bug)
          const a2 = mesh.program.uniforms.uAspect2.value as number[];
          mesh.program.uniforms.uAspect1.value = [a2[0], a2[1]];

          // Snap transition back to 0 — invisible because t1 now matches
          program.uniforms.uTransition.value = 0;
        }
      }

      if (!velocityNeedsUpdate) {
        velocity.set(0);
      }
      velocityNeedsUpdate = false;

      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(velocity, velocity.len() ? 0.15 : 0.1);
      flowmap.update();

      program.uniforms.uTime.value = t * 0.01;

      // Only render if we have a valid size
      if (gl.canvas.width > 0 && gl.canvas.height > 0) {
        renderer.render({ scene: mesh });
      }
    }

    animationFrameId = requestAnimationFrame(update);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      if (transitionTimer !== undefined) clearInterval(transitionTimer);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);

      if (hitTarget) {
        if (isTouchCapable) {
          hitTarget.removeEventListener("touchstart",  updateMouse as EventListener);
          hitTarget.removeEventListener("touchmove",   updateMouse as EventListener);
          hitTarget.removeEventListener("touchend",    resetMouse  as EventListener);
        } else {
          hitTarget.removeEventListener("mousemove",   updateMouse as EventListener);
          hitTarget.removeEventListener("mouseleave",  resetMouse  as EventListener);
          hitTarget.removeEventListener("mouseenter",  showCursor);
        }
      }

      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount once — all mutable values are accessed via refs

  return (
    <div className={className}>
      {/* WebGL canvas container — pointer-events handled by the hit SVG */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={maskStyle}
      >
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500"
          style={{ opacity: 0, mixBlendMode: "overlay" }}
        />
      </div>

      {/* Hit-testing overlay — pointer-events only within the SVG path */}
      {hitPathD && (
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          viewBox={hitPathViewBox}
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            ref={hitPathRef}
            d={hitPathD}
            fill="transparent"
            style={{ pointerEvents: "all", cursor: "none" }}
          />
        </svg>
      )}

      {/* Custom glass cursor */}
      {showGlassCursor && (
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 hidden md:block"
          style={{
            background:          "rgba(255, 255, 255, 0.05)",
            backdropFilter:      "blur(4px)",
            WebkitBackdropFilter:"blur(4px)",
            border:              "1px solid rgba(255, 255, 255, 0.2)",
            opacity:             0,
            transition:          "opacity 0.4s ease",
            marginLeft:          "-16px",
            marginTop:           "-16px",
            willChange:          "transform, opacity",
          }}
        />
      )}
    </div>
  );
}
