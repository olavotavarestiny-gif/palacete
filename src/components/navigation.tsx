"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content";
import { FormButton } from "./palace-provider";
import { Icon } from "./icons";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => { setOpen(false); mobileDialog.current?.close(); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileDialog.current?.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  function close() { mobileDialog.current?.close(); setOpen(false); toggle.current?.focus(); }

  return <>
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-inner">
        <nav className="desktop-nav nav-left" aria-label="Navegação principal">{site.nav.slice(1, 4).map(link => <Link key={link.label} href={link.href}>{link.label}</Link>)}</nav>
        <button ref={toggle} type="button" className="menu-toggle" aria-label="Abrir navegação" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><span /><span /><span /></button>
        <Link className="brand" href="/" aria-label="Palace Lounge — início"><Image src={site.logo} width={130} height={86} alt="Palace Lounge" preload /></Link>
        <div className="header-right"><nav className="desktop-nav nav-right" aria-label="Mais sobre o Palace">{site.nav.slice(4).map(link => <Link key={link.label} href={link.href}>{link.label}</Link>)}</nav><FormButton className="button button-primary header-reserve">Reservar <span className="reserve-word">mesa</span></FormButton></div>
      </div>
    </header>
    <dialog ref={mobileDialog} id="mobile-navigation" className="mobile-navigation" aria-label="Navegação" onCancel={close}>
      <div className="mobile-navigation-top"><Image src={site.logo} width={105} height={70} alt="Palace Lounge" /><button className="icon-button" onClick={close} aria-label="Fechar navegação"><Icon name="close" /></button></div>
      <nav>{site.nav.map((link, i) => <Link key={link.label} href={link.href} onClick={close}><span>0{i + 1}</span>{link.label}<Icon name="diagonal" /></Link>)}</nav>
      <p className="eyebrow">{site.shortLocation}</p>
      <FormButton onClick={close} className="button button-primary mobile-menu-reserve">Reservar mesa <Icon /></FormButton>
    </dialog>
  </>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container footer-main">
    <Link href="/" className="footer-brand" aria-label="Palace Lounge — início"><Image src={site.logo} width={180} height={119} alt="Palace Lounge" /><span>A arte de bem receber.</span></Link>
    <div><p className="footer-label">Descubra</p><nav aria-label="Navegação do rodapé"><Link href="/#o-palace">O Palace</Link><Link href="/menu">O nosso menu</Link><Link href="/#experiencias">Experiências</Link></nav></div>
    <div><p className="footer-label">O universo Palace</p><nav aria-label="Universo Palace"><Link href="/#palace-prive">Palace Privé</Link><Link href="/#palace-beach">Palace Beach</Link><Link href="/#galeria">Galeria</Link></nav></div>
    <div className="footer-visit"><p className="footer-label">Encontre-nos</p><p>Palácio de Ferro<br />Luanda, Angola</p><a href={site.instagram} target="_blank" rel="noopener noreferrer" className="footer-instagram"><Icon name="instagram" width="17" height="17" />{site.instagramHandle}</a></div>
  </div><div className="container footer-bottom"><p>© {new Date().getFullYear()} Palace Lounge. Todos os direitos reservados.</p><Link href="/privacidade">Política de Privacidade</Link><a href="/#inicio" className="back-top">Voltar ao início <Icon name="arrow" width="16" height="16" /></a></div></footer>;
}
