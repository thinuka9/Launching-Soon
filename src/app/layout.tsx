import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Notch Creative — Reality, Reimagined.",
  description:
    "Notch Creative is a boutique creative agency crafting bold, editorial visual identities. Launching soon.",
  openGraph: {
    title: "Notch Creative — Reality, Reimagined.",
    description:
      "Notch Creative is a boutique creative agency crafting bold, editorial visual identities. Launching soon.",
    url: "https://thenotchcreative.com",
    siteName: "Notch Creative",
    type: "website",
    images: [
      {
        url: "/hero.png",
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
    images: ["/hero.png"],
  },
  icons: {
    icon: "/svgs/mask.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-[#040506] text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
