import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { Admin } from '../types/Index';

export async function getAdmin(uid: string): Promise<Admin | null> {
  const snap = await getDoc(doc(db, 'admins', uid));
  if (snap.exists()) return { id: snap.id, ...snap.data() } as Admin;

  // Fallback para admins criados antes da coleção 'admins' existir:
  // busca nome em 'usuarios' e constrói um Admin mínimo
  const usuarioSnap = await getDoc(doc(db, 'usuarios', uid));
  if (!usuarioSnap.exists()) return null;
  const u = usuarioSnap.data();
  return { id: uid, nome: u.nome ?? 'Admin', cpf: u.cpf ?? '', uid } as Admin;
}

/**
 * Cria um novo admin via Cloud Function.
 * Só funciona se não houver nenhum admin cadastrado (setup inicial).
 * Para admins adicionais, use o Firebase Console.
 */
export async function criarAdmin(dados: {
  nome: string;
  cpf: string;
  senha: string;
}): Promise<{ uid: string }> {
  const fn = httpsCallable<typeof dados, { uid: string }>(functions, 'criarAdmin');
  const result = await fn(dados);
  return result.data;
}
