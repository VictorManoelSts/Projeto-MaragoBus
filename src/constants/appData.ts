export const PONTOS_EMBARQUE: string[] = [
  "Posto Shell",
  "Praça Central",
  "Supermercado BH",
  "Igreja Matriz",
  "Rodoviária",
];

export const FACULDADES: string[] = [
  "Afya",
  "Anhanguera",
  "Cesmac",
  "Estácio",
  "FAP",
  "Florence",
  "Grau Técnico",
  "iGA",
  "Pitágoras",
  "UFAL",
  "UMJ",
  "Uniasselvi",
  "Unicesumar",
  "Unicisal",
  "Uninassau",
  "Unip",
  "UniRB",
  "Unopar",
];

export const CURSOS: string[] = [
  "Enfermagem",
  "Direito",
  "Administração",
  "Engenharia Civil",
  "Pedagogia",
  "Psicologia",
  "Medicina",
  "Ciência da Computação",
];

export const MODALIDADES = ["Presencial", "Semipresencial", "Online"] as const;

/** Retorna as iniciais do nome (até 2 letras) */
export function getIniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/** Formata telefone: (XX) XXXXX-XXXX (celular) ou (XX) XXXX-XXXX (fixo) */
export function formatarTelefone(raw: string): string {
  const n = raw.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n.length ? `(${n}` : "";
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10)
    return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

/** Formata CPF: remove tudo que não é dígito, aplica máscara */
export function formatarCPF(raw: string): string {
  const n = raw.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}
export function dataHoje(): string {
  return new Date().toLocaleDateString("pt-BR");
}
