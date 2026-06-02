import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import { calcularAdvertencia, calcularNovoStatus } from '../utils/alunos';
import type { Aluno } from '../types/Index';

export async function getAlunos(): Promise<Aluno[]> {
  const snap = await getDocs(collection(db, 'alunos'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Aluno));
}

export async function getAluno(uid: string): Promise<Aluno | null> {
  const snap = await getDoc(doc(db, 'alunos', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Aluno;
}

/** Busca múltiplos alunos por IDs (lotes de 10 — limite do Firestore) */
export async function getAlunosByIds(ids: string[]): Promise<Aluno[]> {
  if (ids.length === 0) return [];
  const alunos: Aluno[] = [];
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const q = query(collection(db, 'alunos'), where('__name__', 'in', chunk));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => alunos.push({ id: d.id, ...d.data() } as Aluno));
  }
  return alunos;
}

export async function updateAluno(
  id: string,
  dados: Partial<Omit<Aluno, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'alunos', id), {
    ...dados,
    updatedAt: serverTimestamp(),
  });
}

/** Aplica advertência e suspende automaticamente ao atingir 3 */
export async function aplicarAdvertencia(aluno: Aluno): Promise<Aluno> {
  const patch = calcularAdvertencia(aluno);
  await updateAluno(aluno.id, patch);
  // Registra log de advertência
  await setDoc(doc(collection(db, 'advertencias')), {
    alunoId:  aluno.id,
    numero:   patch.advertencias,
    criadoEm: serverTimestamp(),
  });
  return { ...aluno, ...patch };
}

export async function alternarStatus(aluno: Aluno): Promise<Aluno> {
  const status = calcularNovoStatus(aluno.status);
  await updateAluno(aluno.id, { status });
  return { ...aluno, status };
}

/**
 * Chama a Cloud Function `excluirAluno`, que remove o usuário do
 * Firebase Auth e do Firestore (requer Admin SDK no servidor).
 */
export async function excluirAluno(alunoId: string): Promise<void> {
  const fn = httpsCallable(functions, 'excluirAluno');
  await fn({ alunoId });
}

/**
 * Chama a Cloud Function `criarAluno`, que cria o usuário no
 * Firebase Auth e salva os dados no Firestore.
 */
export async function criarAluno(dados: {
  nome: string;
  cpf: string;
  senha: string;
  telefone: string;
  endereco: string;
  faculdade: string;
  curso: string;
  modalidade: string;
  semestreAtual: number;
  anoConclusao: number;
  pontoEmbarque: string;
}): Promise<{ uid: string }> {
  const fn = httpsCallable<typeof dados, { uid: string }>(functions, 'criarAluno');
  const result = await fn(dados);
  return result.data;
}
