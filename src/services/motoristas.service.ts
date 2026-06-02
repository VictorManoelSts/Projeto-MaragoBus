import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { Motorista } from '../types/Index';

export async function getMotoristas(): Promise<Motorista[]> {
  const snap = await getDocs(collection(db, 'motoristas'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Motorista));
}

export async function getMotorista(uid: string): Promise<Motorista | null> {
  const snap = await getDoc(doc(db, 'motoristas', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Motorista;
}

export async function criarMotorista(dados: {
  nome: string;
  cpf: string;
  senha: string;
  telefone: string;
}): Promise<{ uid: string }> {
  const fn = httpsCallable<typeof dados, { uid: string }>(functions, 'criarMotorista');
  const result = await fn(dados);
  return result.data;
}

export async function excluirMotorista(motoristaId: string): Promise<void> {
  const fn = httpsCallable(functions, 'excluirMotorista');
  await fn({ motoristaId });
}
