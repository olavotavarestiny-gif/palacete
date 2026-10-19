import { site } from "@/lib/content";

/** The facade is the original official logo, framed to exclude its lettering.
 * No new building, monogram or official symbol is drawn. */
export function ArchitectureSignature({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  return <svg viewBox="0 0 905 430" fill="none" className={`architecture-signature ${animated ? "signature-animated" : ""} ${className}`} aria-hidden="true">
    <image href={site.logo} width="905" height="600" />
  </svg>;
}

/** Crossed rectangular panels taken from the balcony motif in the official logo.
 * This is an editorial divider, not an additional brand emblem. */
export function BalconyDetail({ className = "" }: { className?: string }) {
  return <svg className={`balcony-detail ${className}`} viewBox="0 0 76 18" width="76" height="18" fill="none" stroke="currentColor" strokeWidth=".65" aria-hidden="true">
    <path pathLength="1" d="M1 2h74M1 16h74M2 0v18M26 0v18M50 0v18M74 0v18M2 2l24 14M26 2 2 16M26 2l24 14M50 2 26 16M50 2l24 14M74 2 50 16" />
  </svg>;
}
