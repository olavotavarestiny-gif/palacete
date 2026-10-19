"use client";

import { createContext, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Icon, Ornament } from "./icons";
import { luandaDate, prepareSubmission, validateSubmission, type FormKind, type PalaceSubmission } from "@/lib/forms";

const PalaceContext = createContext<{ openForm: (kind: FormKind, occasion?: string) => void }>({ openForm: () => {} });
export const usePalace = () => useContext(PalaceContext);

export function FormButton({ kind = "reservation", occasion, children, onClick, className = "button button-primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: FormKind; occasion?: string; children: ReactNode }) {
  const { openForm } = usePalace();
  return <button className={className} {...props} onClick={event => { onClick?.(event); openForm(kind, occasion); }}>{children}</button>;
}

const formCopy = {
  reservation: { eyebrow: "O seu lugar à mesa", title: "O próximo momento.", text: "Conte-nos como imagina a sua visita. Os pedidos de reserva estão sujeitos a confirmação.", action: "Solicitar Reserva" },
  prive: { eyebrow: "Um convite especial", title: "Entre no círculo.", text: "Manifeste o seu interesse no Palace Privé e esteja mais próximo das experiências Palace.", action: "Pré-visualizar inscrição" },
  beach: { eyebrow: "Um novo horizonte", title: "Palace Beach.", text: "Manifeste o seu interesse e prepare-se para descobrir uma nova experiência Palace.", action: "Pré-visualizar interesse" },
};

export function PalaceProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<{ kind: FormKind; occasion?: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const el = dialog.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [active]);

  function close() {
    if (submitting) return;
    dialog.current?.close();
    setActive(null);
    opener.current?.focus();
  }

  return <PalaceContext.Provider value={{ openForm: (kind, occasion) => {
    opener.current = document.activeElement as HTMLElement;
    setActive({ kind, occasion });
  } }}>
    {children}
    <dialog ref={dialog} className="form-dialog" aria-labelledby="form-title" onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      {active && <div className="form-dialog-inner">
        <button type="button" className="icon-button dialog-close" aria-label="Fechar formulário" disabled={submitting} onClick={close}><Icon name="close" /></button>
        <PalaceForm key={`${active.kind}-${active.occasion}`} kind={active.kind} occasion={active.occasion} close={close} onBusy={setSubmitting} />
      </div>}
    </dialog>
  </PalaceContext.Provider>;
}

function PalaceForm({ kind, occasion = "", close, onBusy }: { kind: FormKind; occasion?: string; close: () => void; onBusy: (busy: boolean) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const requestRef = useRef<{ fingerprint: string; key: string } | null>(null);
  useEffect(() => { onBusy(loading); }, [loading, onBusy]);
  const [prepared, setPrepared] = useState<PalaceSubmission | null>(null);
  const [draft, setDraft] = useState<PalaceSubmission | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const copy = formCopy[kind];

  useEffect(() => { if (prepared) resultRef.current?.focus(); }, [prepared]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: PalaceSubmission = {
      kind, name: String(fd.get("name") || ""), phone: String(fd.get("phone") || ""), email: String(fd.get("email") || ""), website: String(fd.get("website") || ""),
      date: String(fd.get("date") || ""), time: String(fd.get("time") || ""), guests: String(fd.get("guests") || ""),
      occasion: String(fd.get("occasion") || ""), notes: String(fd.get("notes") || ""),
      birthday: String(fd.get("birthday") || ""), interest: String(fd.get("interest") || ""), consent: fd.get("consent") === "on",
    };
    const nextErrors = validateSubmission(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    setLoading(true);
    setDraft(data);
    try {
      const fingerprint = JSON.stringify(data);
      if (requestRef.current?.fingerprint !== fingerprint) requestRef.current = { fingerprint, key: crypto.randomUUID() };
      const result = await prepareSubmission(data, requestRef.current.key);
      setSaved(result.mode === "saved");
      setPrepared(result.data);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Não foi possível enviar o pedido. Tente novamente." });
    } finally { setLoading(false); }
  }

  const fieldProps = (name: string) => ({ id: `${kind}-${name}`, name, "aria-invalid": !!errors[name] as boolean, "aria-describedby": errors[name] ? `${kind}-${name}-error` : undefined });
  const error = (name: string) => errors[name] && <span className="field-error" id={`${kind}-${name}-error`}>{errors[name]}</span>;

  return <>
    <p className="eyebrow">{copy.eyebrow}</p><h2 id="form-title">{copy.title}</h2><p className="form-intro">{copy.text}</p>
    {kind !== "reservation" && <div className="demo-note"><span className="small-diamond" />Demonstração · Os seus dados não serão enviados.</div>}
    {prepared ? <div ref={resultRef} tabIndex={-1} className="form-result" role="status">
      <span className="result-symbol"><Icon name="check" width="28" height="28" /></span>
      <h3>{saved ? "Pedido de reserva recebido!" : "O seu interesse, em perspectiva."}</h3>
      <p>{saved ? `Obrigado pelo seu interesse no Palace Lounge, ${prepared.name.split(" ")[0]}. A nossa equipa irá analisar o seu pedido e entrar em contacto para confirmar a disponibilidade.` : `Obrigado, ${prepared.name.split(" ")[0]}. Esta é uma pré-visualização. Nenhuma inscrição foi efectuada.`}</p>
      <dl className="result-details"><div><dt>Nome</dt><dd>{prepared.name}</dd></div><div><dt>Contacto</dt><dd>{prepared.phone}</dd></div>
        {kind === "reservation" && <><div><dt>Data e hora</dt><dd>{new Intl.DateTimeFormat("pt-AO", { dateStyle: "long", timeZone: "Africa/Luanda" }).format(new Date(`${prepared.date}T12:00:00+01:00`))}, {prepared.time}</dd></div><div><dt>Pessoas</dt><dd>{prepared.guests}</dd></div>{prepared.occasion && <div><dt>Ocasião</dt><dd>{prepared.occasion}</dd></div>}{prepared.notes && <div><dt>Observações</dt><dd>{prepared.notes}</dd></div>}</>}
        {prepared.interest && <div><dt>Interesse</dt><dd>{prepared.interest}</dd></div>}
        {prepared.birthday && <div><dt>Aniversário</dt><dd>{prepared.birthday.split("-").reverse().join("/")}</dd></div>}
      </dl>
      <p className="fine-print">{saved ? "O seu pedido foi guardado e aguarda análise da equipa. A mesa ainda não está confirmada." : "Os dados foram apenas preparados neste ecrã. Não foram enviados nem guardados. Para informações, visite o Instagram oficial do Palace Lounge."}</p>
      <div className="result-actions"><a href="https://www.instagram.com/palace_lounge_ao/" target="_blank" rel="noopener noreferrer" className="button button-primary">Contactar o Palace <Icon name="diagonal" /></a>{!saved && <button type="button" className="editorial-link" onClick={() => setPrepared(null)}>Editar dados <Icon /></button>}</div>
      <button type="button" className="text-close" onClick={close}>Fechar</button>
    </div> : <form ref={formRef} onSubmit={submit} noValidate className="palace-form">
      <div className="field"><label htmlFor={`${kind}-name`}>O seu nome <span>*</span></label><input {...fieldProps("name")} defaultValue={draft?.name} autoComplete="name" placeholder="Nome completo" maxLength={100} required />{error("name")}</div>
      <div className="field"><label htmlFor={`${kind}-phone`}>{kind === "reservation" ? "Número de contacto" : "Número de WhatsApp"} <span>*</span></label><input {...fieldProps("phone")} defaultValue={draft?.phone} type="tel" autoComplete="tel" placeholder="+244 9XX XXX XXX" maxLength={24} required />{error("phone")}</div>
      {kind === "reservation" && <>
        <div className="field"><label htmlFor={`${kind}-email`}>Email <span className="optional">opcional</span></label><input {...fieldProps("email")} defaultValue={draft?.email} type="email" autoComplete="email" maxLength={254} placeholder="O seu email" />{error("email")}</div>
        <div className="reservation-honeypot" aria-hidden="true"><label htmlFor="reservation-website">Website</label><input id="reservation-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <div className="field-row"><div className="field"><label htmlFor={`${kind}-date`}>Data <span>*</span></label><input {...fieldProps("date")} defaultValue={draft?.date} type="date" min={luandaDate()} required />{error("date")}</div><div className="field"><label htmlFor={`${kind}-time`}>Horário pretendido <span>*</span></label><input {...fieldProps("time")} defaultValue={draft?.time} type="time" required />{error("time")}</div></div>
        <p className="field-hint">Hora de Luanda. A disponibilidade e o horário serão confirmados pelo restaurante.</p>
        <div className="field-row"><div className="field"><label htmlFor={`${kind}-guests`}>Número de pessoas <span>*</span></label><input {...fieldProps("guests")} type="number" min="1" max="50" defaultValue={draft?.guests || "2"} required />{error("guests")}</div><div className="field"><label htmlFor={`${kind}-occasion`}>Ocasião <span className="optional">opcional</span></label><select {...fieldProps("occasion")} defaultValue={draft?.occasion || occasion}><option value="">Seleccione</option><option>Jantar a dois</option><option>Celebração</option><option>Encontro privado</option><option>Outra ocasião</option></select></div></div>
        <div className="field"><label htmlFor={`${kind}-notes`}>Algum detalhe especial? <span className="optional">opcional</span></label><textarea {...fieldProps("notes")} defaultValue={draft?.notes} rows={3} maxLength={1000} placeholder="Partilhe as suas preferências…" /></div>
      </>}
      {kind === "prive" && <div className="field"><label htmlFor={`${kind}-birthday`}>Data de aniversário <span className="optional">opcional</span></label><input {...fieldProps("birthday")} defaultValue={draft?.birthday} type="date" max={luandaDate()} autoComplete="bday" />{error("birthday")}</div>}
      {kind === "beach" && <div className="field"><label htmlFor={`${kind}-interest`}>O que mais lhe interessa? <span>*</span></label><select {...fieldProps("interest")} defaultValue={draft?.interest || ""} required><option value="" disabled>Seleccione o seu interesse</option><option>Gastronomia</option><option>Eventos</option><option>Ambos</option></select>{error("interest")}</div>}
      <div className="consent-field"><label><input {...fieldProps("consent")} defaultChecked={draft?.consent} type="checkbox" required /><span>{kind === "reservation" ? "Autorizo a utilização dos meus dados para tratar este pedido de reserva." : "Autorizo receber novidades e convites do " + (kind === "prive" ? "Palace Privé" : "Palace Beach") + " através do WhatsApp."} <Link href="/privacidade" onClick={close}>Privacidade</Link>.</span></label>{error("consent")}</div>
      {errors.submit && <p role="alert" className="field-error">{errors.submit}</p>}
      <button type="submit" className="button button-primary form-submit" disabled={loading}>{loading ? kind === "reservation" ? "A enviar pedido…" : "A preparar…" : copy.action}<Icon /></button>
      <p className="fine-print">* Campos obrigatórios. {kind === "reservation" ? "Um pedido não constitui uma reserva confirmada. Os dados são usados apenas para tratar a reserva, contactar o visitante e manter o histórico de atendimento, sem autorização de marketing." : "Poderá retirar o seu consentimento quando o serviço estiver activo."}</p>
    </form>}
    <Ornament />
  </>;
}
