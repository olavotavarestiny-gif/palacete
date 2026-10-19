"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { experiences, photos, site } from "@/lib/content";
import { editorial } from "@/lib/editorial";
import { FormButton } from "./palace-provider";
import { Icon } from "./icons";

export function RevealObserver() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    elements.forEach(el => { el.classList.add("will-reveal"); observer.observe(el); });
    const revealAll = () => {
      if (preference.matches) { elements.forEach(el => el.classList.add("is-visible")); observer.disconnect(); }
    };
    preference.addEventListener("change", revealAll);
    return () => { observer.disconnect(); preference.removeEventListener("change", revealAll); };
  }, []);
  return null;
}

function PalaceFilm({ src = site.heroVideo, poster = site.poster, label = "Uma experiência no Palace Lounge", lazy = false }: { src?: string; poster?: string; label?: string; lazy?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    const allowed = () => !preference.matches && !connection?.saveData && !userPaused.current;
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      setInView(visible);
      if (visible && allowed()) { setEnabled(true); void video.current?.play().catch(() => {}); }
      else video.current?.pause();
    }, { threshold: 0.1 });
    if (wrapper.current) observer.observe(wrapper.current);
    const update = () => {
      if (preference.matches) { video.current?.pause(); setEnabled(false); }
      else if (visible && allowed()) setEnabled(true);
    };
    preference.addEventListener("change", update);
    return () => { observer.disconnect(); preference.removeEventListener("change", update); };
  }, [lazy]);
  function toggleVideo() {
    if (playing) { userPaused.current = true; video.current?.pause(); }
    else { userPaused.current = false; setEnabled(true); void video.current?.play().catch(() => {}); }
  }
  return <div className="palace-film" ref={wrapper}>
    <Image src={poster} alt={label} fill sizes="(max-width: 767px) 100vw, 50vw" preload={!lazy} className="film-poster" />
    <video ref={video} src={enabled ? src : undefined} poster={poster} muted loop playsInline autoPlay={enabled && inView} preload="none" aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
    {!failed && <button className="film-toggle" onClick={toggleVideo} aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}><Icon name={playing ? "pause" : "play"} width="16" height="16" /></button>}
  </div>;
}

export function Hero() {
  return <section className="hero hero-refined container" id="inicio" aria-labelledby="hero-title">
    <div className="hero-copy-refined"><p className="eyebrow">{editorial.hero.eyebrow}</p><h1 id="hero-title"><span>Há lugares que</span><span>não se explicam.</span><em>Vivem-se.</em></h1><p className="hero-support">{editorial.hero.description}</p><div className="hero-ctas-refined"><FormButton>Reservar uma mesa</FormButton><a href="#o-palace" className="editorial-link">Descobrir o Palace <Icon /></a></div></div>
    <div className="hero-media-refined"><PalaceFilm /></div>
  </section>;
}

export function PalaceStory() {
  return <section className="simple-story refined-section container" id="o-palace" aria-labelledby="story-title"><figure data-reveal><div className="story-image-refined image-wrap"><Image {...photos.entrance} fill sizes="(max-width: 767px) 90vw, 42vw" /></div></figure><div className="section-copy" data-reveal><p className="eyebrow">O Palace</p><h2 id="story-title">Um cenário<br /><em>com história.</em></h2><p>{editorial.arrival.text}</p><p className="section-secondary">{editorial.arrival.detail}</p><a href={site.maps} target="_blank" rel="noopener noreferrer" className="editorial-link">Encontre-nos em Luanda <Icon name="diagonal" /></a></div></section>;
}

export function MenuPreview() {
  return <section className="simple-gastronomy refined-section container" id="gastronomia" aria-labelledby="gastronomy-title"><div className="section-copy" data-reveal><p className="eyebrow">Gastronomia</p><h2 id="gastronomy-title">A experiência<br />começa <em>à mesa.</em></h2><p>{editorial.table.text}</p><Link href="/menu" className="editorial-link">Conhecer os sabores <Icon /></Link></div><figure data-reveal><div className="gastronomy-image-refined image-wrap"><Image {...photos.food} fill sizes="(max-width: 767px) 90vw, 48vw" /></div></figure></section>;
}

export function Experiences() {
  return <section className="simple-experiences refined-section container" id="experiencias" aria-labelledby="experiences-title"><div className="refined-section-heading" data-reveal><p className="eyebrow">Experiências</p><h2 id="experiences-title">Quando a noite chega,<br /><em>a experiência continua.</em></h2><p>{editorial.night.text}</p></div><Gallery /><div className="night-occasions" data-reveal><p>Uma mesa para a sua ocasião.</p><div>{experiences.map(experience => <FormButton key={experience.number} occasion={experience.occasion} className="occasion-link">{experience.title}<Icon /></FormButton>)}</div></div></section>;
}

export function ReservationSection() {
  return <section className="final-invitation container" id="reservas" aria-labelledby="reservation-title" data-reveal><p className="eyebrow">O convite fica feito</p><h2 id="reservation-title">A próxima experiência<br />começa com <em>uma reserva.</em></h2><p>Esperamos por si no Palace Lounge.</p><FormButton>Reservar uma mesa</FormButton><span className="final-invitation-note">Pedidos sujeitos a confirmação pelo restaurante.</span></section>;
}

export function PalacePrive() {
  return <section className="prive-editorial container" id="palace-prive" aria-labelledby="prive-title" data-reveal><div className="prive-panel"><p className="eyebrow">Palace Privé</p><h2 id="prive-title">Alguns convites<br /><em>são especiais.</em></h2><p>{editorial.prive.description}</p><FormButton kind="prive" className="button button-primary">Receber o meu convite</FormButton></div></section>;
}

export function PalaceBeach() {
  return <section className="beach-editorial container" id="palace-beach" aria-labelledby="beach-title" data-reveal><div><p className="eyebrow">Em breve</p><h2 id="beach-title">O próximo capítulo:<br /><em>Palace Beach.</em></h2></div><div className="beach-information"><p>{editorial.beach.description}</p><FormButton kind="beach" className="editorial-link">Ser dos primeiros a saber <Icon /></FormButton></div></section>;
}

const galleryPhotos = [photos.terrace, photos.food, photos.cocktails, photos.table, photos.details, photos.entrance];
const nightPhotoIndexes = [0, 2];

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const lightbox = useRef<HTMLDialogElement>(null);
  const touchStart = useRef(0);
  const openButton = useRef<HTMLButtonElement | null>(null);
  const isOpen = active !== null;
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightbox.current?.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);
  function next(delta: number) { setActive(current => current === null ? null : (current + delta + galleryPhotos.length) % galleryPhotos.length); }
  function close() { lightbox.current?.close(); setActive(null); openButton.current?.focus(); }

  return <div className="night-gallery" id="galeria"><div className="night-photo-sequence">{nightPhotoIndexes.map((photoIndex, index) => {
    const photo = galleryPhotos[photoIndex];
    return <figure className={`night-figure night-figure-${index + 1}`} key={photo.src} data-reveal><button type="button" className="night-photo image-wrap" aria-label={`Ampliar fotografia ${photoIndex + 1}: ${photo.alt}`} onClick={event => { openButton.current = event.currentTarget; setActive(photoIndex); }}><Image {...photo} fill sizes="(max-width: 767px) 90vw, 44vw" /><span className="gallery-expand"><Icon name="expand" width="17" height="17" /></span></button><figcaption>{["A luz que convida a ficar.", "Um brinde, antes de tudo."][index]}</figcaption></figure>;
  })}</div><div className="night-gallery-footer"><button className="editorial-link" onClick={event => { openButton.current = event.currentTarget; setActive(0); }}>Ver toda a galeria <Icon name="expand" /></button></div>
    <dialog ref={lightbox} className="lightbox" aria-label="Galeria de fotografias do Palace Lounge" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); next(1); } if (event.key === "ArrowLeft") { event.preventDefault(); next(-1); } }}>
      {active !== null && <div className="lightbox-content" onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) next(delta > 0 ? -1 : 1); }}><div className="lightbox-top"><span className="eyebrow">Palace Lounge · {String(active + 1).padStart(2, "0")} / 06</span><button onClick={close} className="icon-button" aria-label="Fechar fotografia"><Icon name="close" /></button></div><div className="lightbox-image"><Image {...galleryPhotos[active]} fill sizes="(max-width: 767px) 90vw, 70vw" quality={95} /></div><div className="lightbox-bottom"><button onClick={() => next(-1)} className="icon-button" aria-label="Fotografia anterior"><Icon name="arrow" className="rotate-arrow" /></button><p aria-live="polite">{galleryPhotos[active].alt}</p><button onClick={() => next(1)} className="icon-button" aria-label="Fotografia seguinte"><Icon /></button></div></div>}
    </dialog>
  </div>;
}

export function Contact() {
  return <section className="contact-editorial container" id="contactos" aria-labelledby="contact-title"><div><p className="eyebrow">O lugar do nosso encontro</p><h2 id="contact-title">Palace Lounge</h2><p>Palácio de Ferro · Luanda, Angola</p><a href={site.maps} target="_blank" rel="noopener noreferrer" className="editorial-link">Traçar o caminho <Icon name="diagonal" /></a></div><div className="contact-editorial-details"><p className="eyebrow">Continuamos a conversa</p><a href={site.instagram} target="_blank" rel="noopener noreferrer" className="contact-editorial-instagram"><Icon name="instagram" />{site.instagramHandle}<Icon name="diagonal" /></a>{site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}{site.openingHours && <p>{site.openingHours}</p>}<p>Para informações e horários actualizados,<br />consulte o nosso Instagram.</p></div></section>;
}
