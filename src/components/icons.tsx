import type { SVGProps } from "react";
import { BalconyDetail } from "./palace-identity";

export function Icon({ name = "arrow", ...props }: SVGProps<SVGSVGElement> & { name?: string }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {name === "arrow" && <><path d="M4 12h15M13 6l6 6-6 6" /></>}
    {name === "diagonal" && <path d="M6 18 18 6M6 6h12v12" />}
    {name === "pin" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></>}
    {name === "close" && <path d="m6 6 12 12M6 18 18 6" />}
    {name === "pause" && <path d="M9 6v12M15 6v12" />}
    {name === "play" && <path d="m9 5 11 7-11 7Z" />}
    {name === "instagram" && <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17 7h.01" strokeWidth="2.4" /></>}
    {name === "chevron" && <path d="m9 5 7 7-7 7" />}
    {name === "check" && <path d="m5 12 4 4L19 6" />}
    {name === "expand" && <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />}
  </svg>;
}

export function Ornament({ className = "" }: { className?: string }) {
  return <span className={`ornament ${className}`} aria-hidden="true"><span /><BalconyDetail /><span /></span>;
}
