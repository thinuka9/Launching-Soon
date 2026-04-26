"use client";

import { useRef, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import Clarity from '@microsoft/clarity';

interface SocialButtonProps {
  href: string;
  label: string;
  tooltip: string;
  icon: React.ReactNode;
  id: string;
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export default function SocialButton({ 
  href, 
  label, 
  tooltip, 
  icon, 
  id, 
  visible, 
  onEnter, 
  onLeave 
}: SocialButtonProps) {
  const tooltipId = `tooltip-${id}`;
  const ref = useRef<HTMLAnchorElement>(null);

  // ── Mouse Tracking for Gradients ───────────────────────────────────
  const mouseX = useMotionValue(24);
  const mouseY = useMotionValue(24);
  
  const springX = useSpring(mouseX, { stiffness: 500, damping: 50 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 50 });
  
  const xPercentage = useTransform(springX, [0, 48], [0, 100]);
  const yPercentage = useTransform(springY, [0, 48], [0, 100]);

  const buttonBackground = useMotionTemplate`radial-gradient(circle at ${xPercentage}% ${yPercentage}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 80%)`;
  const tooltipBackground = useMotionTemplate`radial-gradient(97.98% 97.98% at ${xPercentage}% 100%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.2) 100%)`;

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    onLeave();
    mouseX.set(24);
    mouseY.set(24);
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* ── Tooltip ─────────────────────────────────────────────────── */}
      <motion.div
        id={tooltipId}
        role="tooltip"
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 15,
          scale: visible ? 1 : 0.95,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="absolute bottom-[calc(100%+12px)] pointer-events-none whitespace-nowrap tooltip-text"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "5px 10px 6px",
          gap: "4px",
          background: visible
            ? tooltipBackground
            : "radial-gradient(97.98% 97.98% at 51.83% 100%, rgba(255, 255, 255, 0.31) 0%, rgba(255, 255, 255, 0.248) 100%)",
          border: "0.5px solid rgba(255, 255, 255, 0.09)",
          borderRadius: "10px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          color: "#FFFFFF",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        {tooltip}
      </motion.div>

      {/* ── Main Button ─────────────────────────────────────────────── */}
      <motion.a
        ref={ref}
        id={id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        aria-describedby={tooltipId}
        onMouseEnter={onEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={(e) => {
          e.stopPropagation();
          handleMouseMove(e);
        }}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={() => Clarity.event(`social_click_${id}`)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-[44px] h-[44px] rounded-[14px] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 cursor-pointer overflow-hidden"
        style={{
          background: visible ? buttonBackground : "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
        }}
      >
        <motion.div
          animate={{ scale: visible ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="pointer-events-none"
        >
          {icon}
        </motion.div>
      </motion.a>
    </div>
  );
}
