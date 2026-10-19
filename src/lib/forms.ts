export type FormKind = "reservation" | "prive" | "beach";
export type PalaceSubmission = {
  kind: FormKind;
  name: string;
  phone: string;
  email?: string;
  website?: string;
  date?: string;
  time?: string;
  guests?: string;
  occasion?: string;
  notes?: string;
  birthday?: string;
  interest?: string;
  consent: boolean;
};

export function luandaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Luanda", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export function validateSubmission(data: PalaceSubmission) {
  const errors: Record<string, string> = {};
  if (data.name.trim().length < 2) errors.name = "Indique o seu nome, com pelo menos 2 caracteres.";
  if (!/^\+?[\d\s()-]{7,24}$/.test(data.phone.trim()) || data.phone.replace(/\D/g, "").length < 9 || data.phone.replace(/\D/g, "").length > 15) {
    errors.phone = "Indique um contacto válido, por exemplo +244 9XX XXX XXX.";
  }
  if (!data.consent) errors.consent = data.kind === "reservation"
    ? "Autorize a utilização dos dados para este pedido."
    : "É necessária a sua autorização para receber comunicações.";
  if (data.kind === "reservation") {
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date)) || new Date(data.date).toISOString().slice(0,10) !== data.date || data.date < luandaDate()) errors.date = "Escolha a data de hoje ou uma data futura válida.";
    if (!data.time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) errors.time = "Indique um horário válido.";
    if (!data.guests || !Number.isInteger(Number(data.guests)) || Number(data.guests) < 1 || Number(data.guests) > 50) errors.guests = "Indique entre 1 e 50 pessoas.";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Indique um email válido.";
    if (data.date === luandaDate() && data.time) {
      const now = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Luanda", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
      if (data.time <= now) errors.time = "Escolha um horário futuro (hora de Luanda).";
    }
  }
  if (data.kind === "beach" && !["Gastronomia", "Eventos", "Ambos"].includes(data.interest || "")) errors.interest = "Seleccione o seu interesse.";
  if (data.birthday && data.birthday > luandaDate()) errors.birthday = "Indique uma data de aniversário válida, até à data de hoje.";
  return errors;
}

/** Reservations are saved through a same-origin server proxy. Other forms remain demonstrations. */
export async function prepareSubmission(data: PalaceSubmission, requestId?: string): Promise<{ mode: "demo" | "saved"; data: PalaceSubmission; reference?: string }> {
  const errors = validateSubmission(data);
  if (Object.keys(errors).length) throw new Error("Verifique os campos assinalados.");
  if (data.kind !== "reservation") return { mode: "demo", data };
  let response: Response;
  try { response = await fetch('/api/reservations', {
    method:'POST', headers:{'Content-Type':'application/json','Idempotency-Key':requestId || crypto.randomUUID()},
    body:JSON.stringify(data),
  }); } catch { throw new Error('Sem ligação. Os seus dados continuam no formulário. Tente novamente.'); }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível enviar o pedido. Tente novamente.');
  if (result.received !== true || typeof result.reference !== 'string') throw new Error('Não foi possível verificar a recepção do pedido. Tente novamente.');
  return { mode:'saved', data, reference:result.reference };
}
