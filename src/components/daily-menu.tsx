import Link from "next/link";
import { formatPrice } from "@/lib/content";
import { editionDate, type MenuEdition } from "@/lib/menu-source";
import { Icon } from "./icons";

export function DailyMenu({ edition }: { edition: MenuEdition }) {
  const selections = edition.categories.slice(0, 4).map(category => ({
    id: category.id,
    category: category.subtitle || category.title,
    dish: category.items[Math.min(category.items.length - 1, category.id === "carne" ? 1 : 0)],
  }));

  return <section className="daily-menu-section container" id="menu-do-dia" aria-labelledby="daily-menu-title">
    <div className="daily-menu-intro" data-reveal><p className="eyebrow">A carta, em primeira mão</p><h2 id="daily-menu-title">Hoje, à mesa<br /><em>do Palace.</em></h2><p>Uma selecção da nossa carta.<br />O convite é escolher sem pressa.</p><span className="daily-source-label">{edition.status === "reference" ? "Pré-visualização demonstrativa" : "Edição publicada"}</span>{edition.status === "reference" && <p className="daily-source-detail">Carta fornecida de {editionDate(edition.date)}.<br />Confirme a oferta do dia com o restaurante.</p>}<Link className="editorial-link" href="/menu">Descobrir toda a carta <Icon /></Link></div>
    <article className="menu-paper" data-reveal aria-label="Selecção do menu do dia"><div className="menu-paper-border"><p className="eyebrow menu-paper-brand">Palace Lounge</p><div className="menu-paper-title"><h3>Menu do Dia</h3></div><time dateTime={edition.date}>{editionDate(edition.date)}</time>{edition.status === "reference" && <span className="menu-paper-status">Pré-visualização · carta de referência</span>}<div className="menu-paper-dishes">{selections.map(({ id, category, dish }) => <div className="menu-paper-dish" key={id}><p>{category}</p><div><h4>{dish.name}</h4><span>{formatPrice(dish.price)}{dish.unit && <small> {dish.unit}</small>}</span></div>{dish.description && <span className="menu-paper-description">{dish.description}</span>}</div>)}</div><Link href="/menu" className="button button-secondary">Consultar o menu completo <Icon /></Link><p className="menu-paper-fine-print">Preços em Kwanza · IVA incluído<br />Serviço sujeito a disponibilidade.</p></div></article>
  </section>;
}
