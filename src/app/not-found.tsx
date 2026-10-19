import Link from "next/link";
import { Ornament } from "@/components/icons";

export default function NotFound() {
  return <main id="main" className="not-found container"><p className="eyebrow">Palace Lounge · 404</p><h1>O seu lugar é<br /><em>por aqui.</em></h1><Ornament /><p>Esta página não foi encontrada. Convidamo-lo a regressar ao Palace.</p><Link className="button button-primary" href="/">Voltar ao início</Link></main>;
}
