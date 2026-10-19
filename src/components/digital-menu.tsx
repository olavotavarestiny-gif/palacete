"use client";

import Image from "next/image";
import { useState } from "react";
import { formatPrice, photos, site } from "@/lib/content";
import type { MenuEdition } from "@/lib/menu-source";
import { FormButton } from "./palace-provider";
import { Icon, Ornament } from "./icons";

const categoryLabels: Record<string, string> = { entradas: "Entradas", "peixe-marisco": "Peixe & marisco", carne: "Carne", grelhados: "Grelhados" };

export function DigitalMenu({ edition, dateLabel }: { edition: MenuEdition; dateLabel: string }) {
  const [category, setCategory] = useState("todos");
  const menuCategories = edition.categories;
  const visibleCategories = category === "todos" ? menuCategories : menuCategories.filter(item => item.id === category);

  return <><section className="menu-intro container"><p className="eyebrow">A experiência à mesa</p><h1>O nosso <em>menu.</em></h1><Ornament /><p>Da cozinha do Palace para a sua mesa.<br />Escolha o seu próximo encontro com a carta.</p><div className="menu-source-note">{edition.status === "reference" ? "Carta de referência" : "Edição publicada"} · {dateLabel}<br /><span>Preços em Kwanza, IVA incluído. Serviço sujeito a disponibilidade.</span></div></section>
    <div className="menu-category-bar"><nav className="container menu-categories" aria-label="Categorias do menu"><button onClick={() => setCategory("todos")} aria-pressed={category === "todos"}>Toda a carta</button>{menuCategories.map(item => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>{categoryLabels[item.id] || item.subtitle}</button>)}</nav></div>
    <section className="digital-menu-content container"><div className="menu-dishes" aria-live="polite" aria-atomic="false">{visibleCategories.map((item, index) => <section key={item.id} className="menu-category" aria-labelledby={`category-${item.id}`}><div className="menu-category-heading"><span className="eyebrow">{item.subtitle}</span><h2 id={`category-${item.id}`}>{item.title}</h2></div>{item.items.map(dish => <article key={dish.name} className="menu-dish"><div><h3>{dish.name}</h3>{dish.description && <p>{dish.description}</p>}</div><span className="dish-price">{formatPrice(dish.price)}{dish.unit && <small> {dish.unit}</small>}</span></article>)}{index < visibleCategories.length - 1 && <Ornament />}</section>)}</div><aside className="menu-aside"><div className="menu-aside-photo image-wrap"><Image {...photos.food} fill sizes="(max-width: 900px) 90vw, 30vw" preload /></div><p className="eyebrow">Da nossa mesa para a sua.</p><p className="menu-aside-quote">O prazer está<br /><em>nos detalhes.</em></p><FormButton>Reservar mesa <Icon name="diagonal" /></FormButton><p className="fine-print">Tem alguma alergia ou restrição alimentar? Informe o restaurante antes de fazer o seu pedido.</p></aside></section>
    <div className="menu-bottom-note container"><Ornament /><p>{edition.status === "reference" ? `Esta carta reproduz o menu fornecido, datado de ${dateLabel}.` : `Carta publicada de ${dateLabel}.`}<br />A oferta, os preços e a disponibilidade devem ser confirmados com o restaurante.</p>{edition.status === "reference" && <a href={site.menuOriginal} target="_blank" rel="noopener noreferrer" className="editorial-link">Consultar o menu original <Icon name="diagonal" /></a>}</div></>;
}
