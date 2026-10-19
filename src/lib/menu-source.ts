import "server-only";
import { menuCategories, type MenuCategory } from "./content";

export type MenuEdition = {
  date: string;
  status: "published" | "reference";
  categories: MenuCategory[];
};

const referenceEdition: MenuEdition = {
  date: "2026-10-19",
  status: "reference",
  categories: menuCategories,
};

function isCategory(value: unknown): value is MenuCategory {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return typeof c.id === "string" && /^[a-z0-9-]+$/.test(c.id) &&
    typeof c.title === "string" && typeof c.subtitle === "string" &&
    Array.isArray(c.items) && c.items.length > 0 && c.items.length <= 100 && c.items.every(item =>
      item && typeof item === "object" && typeof item.name === "string" && item.name.trim().length > 0 &&
      typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
      (item.description === undefined || typeof item.description === "string") &&
      (item.unit === undefined || typeof item.unit === "string"));
}

/** Public read-only feed from Palace Menu Studio, when one is configured.
 * Both the homepage and /menu read this same edition. No customer data is sent. */
export async function getMenuEdition(): Promise<MenuEdition> {
  const endpoint = process.env.PALACE_MENU_FEED_URL;
  if (!endpoint) return referenceEdition;
  try {
    const url = new URL(endpoint);
    if (!["http:", "https:"].includes(url.protocol)) return referenceEdition;
    const response = await fetch(url, { next: { revalidate: 60, tags: ["palace-menu"] }, signal: AbortSignal.timeout(4000) });
    if (!response.ok) return referenceEdition;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return referenceEdition;
    const edition = data as Record<string, unknown>;
    if (edition.status !== "published" || typeof edition.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(edition.date) || Number.isNaN(Date.parse(edition.date)) || new Date(edition.date).toISOString().slice(0, 10) !== edition.date ||
      !Array.isArray(edition.categories) || !edition.categories.length || edition.categories.length > 20 ||
      !edition.categories.every(isCategory)) return referenceEdition;
    const ids = edition.categories.map(category => category.id);
    if (new Set(ids).size !== ids.length) return referenceEdition;
    return { date: edition.date, status: "published", categories: edition.categories };
  } catch {
    return referenceEdition;
  }
}

export function editionDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Luanda" }).format(new Date(`${date}T12:00:00+01:00`));
}
