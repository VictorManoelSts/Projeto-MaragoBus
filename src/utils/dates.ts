// Formata uma Date para YYYY-MM-DD usando hora local (evita deslocamento UTC)
export function toYMD(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function dataAtual(): string {
  return toYMD(new Date());
}

// Retorna a próxima segunda-feira a partir de sexta, sábado ou domingo
export function proximaSegunda(d: Date): Date {
  const next = new Date(d);
  const dia = d.getDay(); // 5=Sex, 6=Sáb, 0=Dom
  const daysToAdd = dia === 5 ? 3 : dia === 6 ? 2 : 1;
  next.setDate(d.getDate() + daysToAdd);
  return next;
}

// Retorna o próximo dia útil (seg–sex), pulando fim de semana
export function dataAmanha(): string {
  const now = new Date();
  const dia = now.getDay();
  if (dia === 5 || dia === 6 || dia === 0) return toYMD(proximaSegunda(now));
  const next = new Date(now);
  next.setDate(now.getDate() + 1);
  return toYMD(next);
}

/**
 * Data alvo para a próxima viagem (apenas seg–sex):
 * - Fim de semana ou sexta ≥17h → segunda-feira
 * - Seg–Sex ≥17h              → próximo dia útil
 * - Seg–Sex <17h              → hoje
 */
export function dataProximaViagem(): string {
  const now  = new Date();
  const hora = now.getHours();
  const dia  = now.getDay(); // 0=Dom, 1=Seg…5=Sex, 6=Sáb

  if (dia === 0 || dia === 6 || (dia === 5 && hora >= 17)) {
    return toYMD(proximaSegunda(now));
  }
  if (hora >= 17) return dataAmanha();
  return dataAtual();
}

export function horaAtualStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
