import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { cpfParaEmail } from '../utils/auth';
import type { UserRole } from '../types/Index';

export { cpfParaEmail };

export async function login(
  cpf: string,
  senha: string,
): Promise<{ uid: string; papel: UserRole }> {
  const email = cpfParaEmail(cpf);
  const cred  = await signInWithEmailAndPassword(auth, email, senha);

  const snap = await getDoc(doc(db, 'usuarios', cred.user.uid));
  if (!snap.exists()) throw new Error('Usuário não encontrado no sistema.');

  const data = snap.data();
  return { uid: cred.user.uid, papel: data.papel as UserRole };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Retorna unsubscribe — use em useEffect */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
