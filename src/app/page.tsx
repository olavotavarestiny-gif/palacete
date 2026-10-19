import { Contact, Experiences, Hero, MenuPreview, PalaceBeach, PalacePrive, PalaceStory, ReservationSection, RevealObserver } from "@/components/home";
import { PalaceOpening } from "@/components/palace-opening";
import { DailyMenu } from "@/components/daily-menu";
import { getMenuEdition } from "@/lib/menu-source";

export const revalidate = 60;

export default async function Home() {
  const edition = await getMenuEdition();
  return <main id="main" className="home-editorial"><PalaceOpening /><RevealObserver /><Hero /><PalaceStory /><MenuPreview /><DailyMenu edition={edition} /><Experiences /><PalacePrive /><PalaceBeach /><ReservationSection /><Contact /></main>;
}
