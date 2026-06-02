import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  dataAtual,
  dataAmanha,
  dataProximaViagem,
  horaAtualStr,
} from '../utils/dates';
import type { Aluno, Reserva } from '../types/Index';

function reservaId(alunoId: string, data: string): string {
  return `${alunoId}_${data}`;
}

// ─── API ─────────────────────────────────────────────────────────────────────

/** Retorna a reserva ativa do aluno (hoje ou amanhã, conforme o horário) */
export async function getReservaAtiva(alunoId: string): Promise<Reserva | null> {
  const data = dataProximaViagem();
  const id   = reservaId(alunoId, data);
  const snap = await getDoc(doc(db, 'reservas', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Reserva;
}

/** Cria reserva para a próxima viagem. Inclui dados denormalizados do aluno. */
export async function criarReserva(aluno: Aluno): Promise<Reserva> {
  const data = dataProximaViagem();
  const id   = reservaId(aluno.id, data);

  const payload = {
    alunoId:       aluno.id,
    data,
    hora:          horaAtualStr(),
    confirmada:    true,
    criadoEm:      serverTimestamp(),
    nomeAluno:     aluno.nome,
    foto:          aluno.foto,
    faculdade:     aluno.faculdade,
    curso:         aluno.curso,
    modalidade:    aluno.modalidade,
    pontoEmbarque: aluno.pontoEmbarque,
    telefone:      aluno.telefone,
    semestreAtual: aluno.semestreAtual,
  };

  await setDoc(doc(db, 'reservas', id), payload);

  return {
    id,
    alunoId:       aluno.id,
    data,
    hora:          payload.hora,
    confirmada:    true,
    nomeAluno:     aluno.nome,
    foto:          aluno.foto,
    faculdade:     aluno.faculdade,
    curso:         aluno.curso,
    modalidade:    aluno.modalidade,
    pontoEmbarque: aluno.pontoEmbarque,
    telefone:      aluno.telefone,
    semestreAtual: aluno.semestreAtual,
  } as Reserva;
}

/** Remove a reserva ativa do aluno */
export async function cancelarReserva(alunoId: string): Promise<void> {
  const data = dataProximaViagem();
  const id   = reservaId(alunoId, data);
  await deleteDoc(doc(db, 'reservas', id));
}

/** Busca todas as reservas de uma data específica (admin / motorista) */
export async function getReservasPorData(data: string): Promise<Reserva[]> {
  const q    = query(collection(db, 'reservas'), where('data', '==', data));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reserva));
}

export { dataAtual, dataAmanha };
