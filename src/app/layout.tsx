import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const helveticaNeue = localFont({
  src: "../fonts/HelveticaNeueLight.otf",
  variable: "--font-helvetica-neue",
  weight: "300",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Notch Creative Studio",
  description:
    "Notch Creative is a boutique creative agency crafting bold, editorial visual identities. Launching soon.",
  openGraph: {
    title: "Notch Creative Studio",
    description:
      "Notch Creative is a boutique creative agency crafting bold, editorial visual identities. Launching soon.",
    url: "https://thenotchcreative.com",
    siteName: "Notch Creative",
    type: "website",
    images: [
      {
        url: "/images/01.webp",
        width: 1200,
        height: 630,
        alt: "Notch Creative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notch Creative — Reality, Reimagined.",
    description: "Launching soon.",
    images: ["/images/01.webp"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${helveticaNeue.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Preload first hero image so the WebGL canvas has texture data immediately */}
        <link rel="preload" href="/images/01.webp" as="image" type="image/webp" />
      </head>
      <body className="min-h-full bg-[#040506] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
