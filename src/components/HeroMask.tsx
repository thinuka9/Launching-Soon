import Image from "next/image";

// The logo-mark SVG path data extracted from assets/video mask.svg
// Used as an inline clipPath so the hero image shows through the "n" glyph shape
export default function HeroMask() {
  return (
    <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
      {/* Full-bleed hero image with gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="Notch Creative — editorial product photography"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
          style={{ objectPosition: "center 30%" }}
        />
        {/* Dark gradient — black from top, red-brown at center, black at edges */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 55% at 50% 65%, rgba(61,10,0,0.0) 0%, rgba(10,5,5,0.55) 60%, #040506 100%),
              linear-gradient(to bottom, #040506 0%, transparent 30%, transparent 60%, #040506 100%)
            `,
          }}
        />
      </div>

      {/* Logo wordmark — centered, sits just above the image reveal line */}
      {/* Positioned absolutely so it floats above the image transition zone */}
    </div>
  );
}
