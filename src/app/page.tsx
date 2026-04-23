import Image from "next/image";
import TaglineLeft from "@/components/TaglineLeft";
import TaglineRight from "@/components/TaglineRight";
import Logo from "@/components/Logo";
import BottomBar from "@/components/BottomBar";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <main
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", backgroundColor: "#040506" }}
    >
      {/* ── WebGL Flowmap Masked Hero ──────────────────────────────────────── */}
      <HeroSection />

      {/* ── Top-left logo ─────────────────── */}
      <div
        className="absolute z-20"
        style={{ top: "clamp(20px, 3vw, 40px)", left: "clamp(20px, 3vw, 40px)" }}
      >
        <Logo className="w-auto h-[36px] md:h-[48px] lg:h-[60px]" />
      </div>

      {/* ── Top-right tagline: "Launching Soon." ──────────────────────── */}
      <div
        className="absolute z-20"
        style={{ top: "clamp(20px, 3vw, 40px)", right: "clamp(20px, 3vw, 40px)" }}
      >
        <TaglineRight className="w-auto h-[28px] md:h-[36px] lg:h-[42px]" />
      </div>

      {/* ── Center tagline: "Reality, Reimagined." ────────────────────────────── */}
      <div
        className="absolute z-20"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          top: "clamp(220px, 50%, 440px)",
          whiteSpace: "nowrap",
        }}
      >
        <TaglineLeft className="w-auto h-[36px] md:h-[48px] lg:h-[60px]" />
      </div>

      {/* ── Bottom bar with social icons ──────────────────────────────── */}
      <div className="relative z-20">
        <BottomBar />
      </div>
    </main>
  );
}
