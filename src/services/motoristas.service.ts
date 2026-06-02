import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

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
