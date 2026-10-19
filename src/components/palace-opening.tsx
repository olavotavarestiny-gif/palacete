"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/content";

/** A short central opening made from two halves of the actual official logo.
 * No invented facade, 3D doors, loading state or scroll lock is used. */
export function PalaceOpening() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || window.location.hash || window.scrollY > 20) {
      setVisible(false);
      return;
    }
    const dismiss = () => setVisible(false);
    const timer = window.setTimeout(dismiss, 2100);
    window.addEventListener("pointerdown", dismiss, { capture: true, once: true });
    window.addEventListener("keydown", dismiss, { capture: true, once: true });
    window.addEventListener("wheel", dismiss, { passive: true, once: true });
    preference.addEventListener("change", dismiss);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", dismiss, true);
      window.removeEventListener("wheel", dismiss);
      preference.removeEventListener("change", dismiss);
    };
  }, [visible]);

  if (!visible) return null;
  return <>
    <link rel="preload" as="image" href={site.logo} fetchPriority="high" />
    <div className="palace-opening" aria-label="Abertura Palace Lounge">
      {["left", "right"].map(side => <div className={`opening-panel opening-panel-${side}`} key={side} aria-hidden="true"><svg className="opening-art" viewBox="0 0 905 600" fill="none"><image href={site.logo} width="905" height="600" /></svg></div>)}
      <p className="opening-welcome" aria-hidden="true">Entre no Palace.</p>
      <button type="button" className="opening-skip" onClick={() => setVisible(false)}>Ignorar abertura</button>
    </div>
    <noscript><style>{".palace-opening { display: none !important; }"}</style></noscript>
  </>;
}
