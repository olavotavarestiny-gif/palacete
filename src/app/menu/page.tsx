import type { Metadata } from "next";
import Link from "next/link";
import { DigitalMenu } from "@/components/digital-menu";
import { Icon } from "@/components/icons";
import { editionDate, getMenuEdition } from "@/lib/menu-source";

export const metadata: Metadata = { title: "O nosso menu", description: "Explore a carta do Palace Lounge em Luanda. Entradas, peixe, marisco e carnes. Preços em Kwanza e navegação por categorias." };

export const revalidate = 60;

export default async function MenuPage() {
  const edition = await getMenuEdition();
  return <main id="main" className="menu-page"><div className="container page-back"><Link href="/" className="editorial-link"><Icon className="rotate-arrow" />Voltar ao Palace</Link></div><DigitalMenu edition={edition} dateLabel={editionDate(edition.date)} /></main>;
}
