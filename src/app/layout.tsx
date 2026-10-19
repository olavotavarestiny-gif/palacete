import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { PalaceProvider } from "@/components/palace-provider";
import { Header, Footer } from "@/components/navigation";
import "./globals.css";
import "./editorial.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (productionHost ? `https://${productionHost}` : "http://localhost:3000")),
  title: { default: "Palace Lounge · No Palácio de Ferro, em Luanda", template: "%s · Palace Lounge" },
  description: "Há lugares que não se explicam. Vivem-se. Descubra a arquitectura, a mesa e a noite do Palace Lounge, no Palácio de Ferro, em Luanda. Consulte o menu e prepare a sua visita.",
  applicationName: "Palace Lounge",
  openGraph: {
    title: "Palace Lounge · Há lugares que não se explicam. Vivem-se.",
    description: "A Chegada. A Mesa. A Noite. Entre no Palace Lounge, no Palácio de Ferro, em Luanda.",
    locale: "pt_AO", type: "website", siteName: "Palace Lounge",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Palace Lounge · Luanda" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#FFFFFF" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-AO" className={`${display.variable} ${body.variable}`}><body>
    <a className="skip-link" href="#main">Saltar para o conteúdo</a>
    <PalaceProvider><Header />{children}<Footer /></PalaceProvider>
  </body></html>;
}
