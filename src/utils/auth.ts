/** Converte CPF (qualquer formato) em e-mail interno para Firebase Auth */
export function cpfParaEmail(cpf: string): string {
  return `${cpf.replace(/\D/g, '')}@maragobus.internal`;
}
