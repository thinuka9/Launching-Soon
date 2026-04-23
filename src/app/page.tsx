import HeroSection from "@/components/HeroSection";
import Logo from "@/components/Logo";
import TaglineLeft from "@/components/TaglineLeft";
import TaglineCenter from "@/components/TaglineCenter";
import BottomBar from "@/components/BottomBar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040506]">
      {/* Header with corner items */}
      <div
        className="fixed top-0 left-0 right-0 flex justify-between items-start z-50 pointer-events-none"
        style={{ padding: "var(--fluid-corner-inset)" }}
      >
        {/* Top Left: notch creative. */}
        <div className="pointer-events-auto">
          <Logo
            className="w-auto"
            style={{ height: "var(--fluid-tagline-h)" }}
          />
        </div>
        {/* Top Right: Reality, Reimagined. */}
        <div className="pointer-events-auto">
          <TaglineLeft
            className="w-auto"
            style={{ height: "var(--fluid-tagline-h)" }}
            wordScale={1.0}
            wordOffsetX={0}
            wordOffsetY={0}
          />
        </div>
      </div>

      {/* Main Center Area: TaglineCenter */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <TaglineCenter
          className="opacity-90 pointer-events-auto"
          style={{ width: "38vw", maxWidth: "680px", height: "auto" }}
        />
      </div>

      {/* Background Hero with WebGL Mask */}
      <HeroSection />

      {/* Social Footer */}
      <BottomBar />
    </main>
  );
}