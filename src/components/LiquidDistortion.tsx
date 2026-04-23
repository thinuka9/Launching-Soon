"use client";

import { useEffect, useRef } from "react";
import { Renderer, Vec2, Geometry, Texture, Program, Mesh, Flowmap } from "ogl";

const _size = [2048, 1638]; // fallback

export interface LiquidDistortionProps {
  /** The path to the image to distort */
  imageUrl: string;
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
}

export default function LiquidDistortion({
  imageUrl,
  className = "",
  maskStyle = {},
  hitPathD,
  hitPathViewBox = "0 0 1920 1080",
  showGlassCursor = false,
}: LiquidDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hitPathRef = useRef<SVGPathElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const imgElement = imgRef.current;
    if (!container || !imgElement) return;

    const renderer = new Renderer({ dpr: 2, alpha: true });
    const gl = renderer.gl;
    
    gl.canvas.style.position = "absolute";
    gl.canvas.style.top = "0";
    gl.canvas.style.left = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.zIndex = "1";
    gl.canvas.style.pointerEvents = "auto"; 

    container.appendChild(gl.canvas);

    let aspect = 1;
    const mouse = new Vec2(-1);
    const velocity = new Vec2();
    let velocityNeedsUpdate = false;

    const flowmap = new Flowmap(gl, { falloff: 0.4, dissipation: 0.94, alpha: 0.5 });

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    const texture = new Texture(gl, { minFilter: gl.LINEAR, magFilter: gl.LINEAR });
    
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
        uniform sampler2D tWater;
        uniform sampler2D tFlow;
        uniform float uTime;
        varying vec2 vUv;
        uniform float uAspectX;
        uniform float uAspectY;
        void main() {
          vec2 uv = (vUv - 0.5) * vec2(uAspectX, uAspectY) + 0.5;
          vec3 flow = texture2D(tFlow, vUv).rgb;
          vec2 myUV = uv - flow.xy * 0.1;
          vec3 tex = texture2D(tWater, myUV).rgb;
          gl_FragColor = vec4(tex, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        tWater: { value: texture },
        uAspectX: { value: 1.0 },
        uAspectY: { value: 1.0 },
        tFlow: flowmap.uniform,
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Ensure image is loaded before assigning to texture and calculating dimensions
    const initTexture = () => {
      texture.image = imgElement;
      resize(); // re-calculate aspect ratio with actual image dimensions
    };
    if (imgElement.complete) {
      initTexture();
    } else {
      imgElement.addEventListener("load", initTexture);
    }

    function resize() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      gl.canvas.width = rect.width * 2.0;
      gl.canvas.height = rect.height * 2.0;
      gl.canvas.style.width = `${rect.width}px`;
      gl.canvas.style.height = `${rect.height}px`;
      
      // Use natural image dimensions for perfect unwarped 'object-fit: cover' behavior
      const imgW = imgElement?.naturalWidth || _size[0];
      const imgH = imgElement?.naturalHeight || _size[1];
      const imageAspect = imgW / imgH;
      const canvasAspect = rect.width / rect.height;
      let a1, a2;
      
      if (canvasAspect > imageAspect) {
        a1 = 1.0;
        a2 = imageAspect / canvasAspect;
      } else {
        a1 = canvasAspect / imageAspect;
        a2 = 1.0;
      }
      
      mesh.program.uniforms.uAspectX.value = a1;
      mesh.program.uniforms.uAspectY.value = a2;
      
      renderer.setSize(rect.width, rect.height);
      aspect = rect.width / rect.height;
    }

    window.addEventListener("resize", resize, false);
    setTimeout(resize, 0);

    const isTouchCapable = "ontouchstart" in window;
    const hitTarget = hitPathRef.current || container;
    
    function showCursor() {
      if (showGlassCursor && cursorRef.current && !isTouchCapable) {
        cursorRef.current.style.opacity = "1";
      }
    }

    if (hitTarget) {
      if (isTouchCapable) {
        hitTarget.addEventListener("touchstart", updateMouse as EventListener, false);
        hitTarget.addEventListener("touchmove", updateMouse as EventListener, { passive: false });
        hitTarget.addEventListener("touchend", resetMouse as EventListener, false);
      } else {
        hitTarget.addEventListener("mousemove", updateMouse as EventListener, false);
        hitTarget.addEventListener("mouseleave", resetMouse as EventListener, false);
        hitTarget.addEventListener("mouseenter", showCursor, false);
      }
    }

    let lastTime: number | undefined;
    const lastMouse = new Vec2();

    function updateMouse(e: MouseEvent | TouchEvent) {
      if (e.type.startsWith('touch')) {
        e.preventDefault();
      }
      
      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        const mouseEvent = e as MouseEvent;
        clientX = mouseEvent.clientX;
        clientY = mouseEvent.clientY;
      }

      // Update custom glass cursor position
      if (showGlassCursor && cursorRef.current && !isTouchCapable) {
        cursorRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
        // Ensure cursor is visible if it was somehow hidden
        if (cursorRef.current.style.opacity === "0") {
          cursorRef.current.style.opacity = "1";
        }
      }

      if (!container) return;
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      mouse.set(x / rect.width, 1.0 - y / rect.height);

      if (!lastTime) { 
        lastTime = performance.now(); 
        lastMouse.set(x, y); 
      }

      const deltaX = x - lastMouse.x;
      const deltaY = y - lastMouse.y;
      lastMouse.set(x, y);
      
      const time = performance.now();
      const delta = Math.max(10.4, time - lastTime);
      lastTime = time;
      
      velocity.x = deltaX / delta;
      velocity.y = deltaY / delta;
      velocityNeedsUpdate = true;
    }
    
    function resetMouse() {
      velocityNeedsUpdate = false;
      mouse.set(-1);
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "0";
      }
    }

    let animationFrameId: number;
    function update(t: number) {
      animationFrameId = requestAnimationFrame(update);
      if (!velocityNeedsUpdate) { 
        mouse.set(-1); 
        velocity.set(0); 
      }
      velocityNeedsUpdate = false;
      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(velocity, velocity.len() ? 0.15 : 0.1);
      flowmap.update();
      program.uniforms.uTime.value = t * 0.01;
      renderer.render({ scene: mesh });
    }
    
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      if (hitTarget) {
        if (isTouchCapable) {
          hitTarget.removeEventListener("touchstart", updateMouse as EventListener);
          hitTarget.removeEventListener("touchmove", updateMouse as EventListener);
          hitTarget.removeEventListener("touchend", resetMouse as EventListener);
        } else {
          hitTarget.removeEventListener("mousemove", updateMouse as EventListener);
          hitTarget.removeEventListener("mouseleave", resetMouse as EventListener);
          hitTarget.removeEventListener("mouseenter", showCursor);
        }
      }
      cancelAnimationFrame(animationFrameId);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [showGlassCursor]); // Re-run if cursor setting changes

  return (
    <div className={className}>
      {/* Visual Mask applied to the WebGL container */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={maskStyle}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Distortion background"
          crossOrigin="anonymous"
          className="sr-only"
        />
      </div>

      {/* Hit Testing Overlay for perfect pointer events bounds */}
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

      {/* Custom Glass Cursor */}
      {showGlassCursor && (
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 hidden md:block"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            opacity: 0,
            transition: "opacity 0.4s ease",
            marginLeft: "-16px",
            marginTop: "-16px",
            willChange: "transform, opacity",
          }}
        />
      )}
    </div>
  );
}
