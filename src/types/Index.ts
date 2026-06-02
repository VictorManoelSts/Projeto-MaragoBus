// ─────────────────────────────────────────────────────────────────────────────
//  ENUMS & LITERALS
// ─────────────────────────────────────────────────────────────────────────────
 
export type UserRole = 'aluno' | 'motorista' | 'admin';
 
export type StatusAluno = 'ativo' | 'suspenso';
 
export type Modalidade = 'Presencial' | 'Semipresencial' | 'Online';
 
// ─────────────────────────────────────────────────────────────────────────────
//  MODELS
// ─────────────────────────────────────────────────────────────────────────────
 
export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  foto: string | null;       // URI local ou URL
  telefone: string;
  endereco: string;
  faculdade: string;
  curso: string;
  modalidade: Modalidade;
  semestreAtual: number;
  anoConclusao: number;
  pontoEmbarque: string;
  status: StatusAluno;
  advertencias: number;
  /** UID do Firebase Auth gerado no cadastro */
  uid?: string;
}
 
export interface Reserva {
  id: string;
  alunoId: string;
  data: string;   // 'YYYY-MM-DD'
  hora: string;   // 'HH:mm'
  confirmada: boolean;
  // Campos denormalizados para exibição rápida (motorista / admin)
  nomeAluno?: string;
  foto?: string | null;
  faculdade?: string;
  curso?: string;
  modalidade?: string;
  pontoEmbarque?: string;
  telefone?: string;
  semestreAtual?: number;
}
 
export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  uid?: string;
}

export interface Admin {
  id: string;
  nome: string;
  cpf: string;
  uid?: string;
}
 
// ─────────────────────────────────────────────────────────────────────────────
//  NAVIGATION PARAM LISTS
// ─────────────────────────────────────────────────────────────────────────────
 
export type RootStackParamList = {
  Login: undefined;
  AlunoTabs: { aluno: Aluno };
  MotoristaRoot: undefined;
  AdminTabs: { admin: Admin };
};
 
export type AlunoTabParamList = {
  Reserva: { aluno: Aluno };
  Comprovante: { aluno: Aluno; reserva: Reserva | null };
};
 
export type AdminTabParamList = {
  AdminReservas: undefined;
  AdminAlunos: undefined;
  AdminMotoristas: undefined;
  AdminCadastro: undefined;
};
 
export type MotoristaTabParamList = {
  Passageiros: undefined;
};
