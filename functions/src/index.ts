import { initializeApp } from 'firebase-admin/app';
import { getAuth }       from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

initializeApp();

const adminAuth = getAuth();
const db        = getFirestore();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cpfParaEmail(cpf: string): string {
  return `${cpf.replace(/\D/g, '')}@maragobus.internal`;
}

async function assertAdmin(uid: string): Promise<void> {
  const snap = await db.collection('usuarios').doc(uid).get();
  if (!snap.exists || snap.data()?.papel !== 'admin') {
    throw new HttpsError('permission-denied', 'Apenas administradores podem realizar esta ação.');
  }
}

// ─── criarAluno ──────────────────────────────────────────────────────────────
// Cria o usuário no Firebase Auth e salva os dados no Firestore.
// Requer que o chamador seja um admin autenticado.

export const criarAluno = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);

    const {
      nome, cpf, senha, telefone, endereco,
      faculdade, curso, modalidade,
      semestreAtual, anoConclusao, pontoEmbarque,
    } = request.data as {
      nome: string; cpf: string; senha: string; telefone: string;
      endereco: string; faculdade: string; curso: string;
      modalidade: string; semestreAtual: number; anoConclusao: number;
      pontoEmbarque: string;
    };

    const email = cpfParaEmail(cpf);

    // Verifica CPF duplicado antes de criar
    try {
      await adminAuth.getUserByEmail(email);
      throw new HttpsError('already-exists', 'Já existe um aluno com este CPF.');
    } catch (err: any) {
      if (err.code !== 'auth/user-not-found') throw err;
    }

    const userRecord = await adminAuth.createUser({
      email,
      password: senha,
      displayName: nome,
    });

    const agora = FieldValue.serverTimestamp();
    const alunoData = {
      nome, cpf, telefone, endereco,
      faculdade, curso, modalidade,
      semestreAtual: Number(semestreAtual),
      anoConclusao:  Number(anoConclusao),
      pontoEmbarque,
      foto:         null,
      status:       'ativo',
      advertencias: 0,
      uid:          userRecord.uid,
      criadoEm:     agora,
      updatedAt:    agora,
    };

    await Promise.all([
      db.collection('alunos').doc(userRecord.uid).set(alunoData),
      db.collection('usuarios').doc(userRecord.uid).set({
        papel: 'aluno', nome, status: 'ativo',
        criadoEm: agora, updatedAt: agora,
      }),
    ]);

    return { uid: userRecord.uid };
  },
);

// ─── criarMotorista ──────────────────────────────────────────────────────────
// Cria usuário com papel 'motorista'.

export const criarMotorista = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);

    const { nome, cpf, senha, telefone } = request.data as {
      nome: string; cpf: string; senha: string; telefone: string;
    };

    const email = cpfParaEmail(cpf);

    try {
      await adminAuth.getUserByEmail(email);
      throw new HttpsError('already-exists', 'Já existe um motorista com este CPF.');
    } catch (err: any) {
      if (err.code !== 'auth/user-not-found') throw err;
    }

    const userRecord = await adminAuth.createUser({
      email,
      password: senha,
      displayName: nome,
    });

    const agora = FieldValue.serverTimestamp();
    await Promise.all([
      db.collection('motoristas').doc(userRecord.uid).set({
        nome, cpf, telefone, uid: userRecord.uid,
        criadoEm: agora, updatedAt: agora,
      }),
      db.collection('usuarios').doc(userRecord.uid).set({
        papel: 'motorista', nome, status: 'ativo',
        criadoEm: agora, updatedAt: agora,
      }),
    ]);

    return { uid: userRecord.uid };
  },
);

// ─── excluirAluno ────────────────────────────────────────────────────────────
// Remove o aluno do Firebase Auth e do Firestore.

export const excluirAluno = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);

    const { alunoId } = request.data as { alunoId: string };

    await Promise.all([
      db.collection('alunos').doc(alunoId).delete(),
      db.collection('usuarios').doc(alunoId).delete(),
      adminAuth.deleteUser(alunoId).catch(() => {}), // ignora se já não existir
    ]);

    return { success: true };
  },
);

// ─── criarAdmin ──────────────────────────────────────────────────────────────
// Use apenas uma vez no setup inicial via Firebase Console ou CLI.
// Após criar o primeiro admin, remova ou proteja este endpoint.

export const criarAdmin = onCall(
  { region: 'southamerica-east1' },
  async (request) => {
    // Só permite se ainda não há admins cadastrados
    const adminsSnap = await db
      .collection('usuarios')
      .where('papel', '==', 'admin')
      .limit(1)
      .get();

    if (!adminsSnap.empty) {
      throw new HttpsError('permission-denied', 'Já existe um admin cadastrado. Use o Firebase Console para criar novos admins.');
    }

    const { nome, cpf, senha } = request.data as {
      nome: string; cpf: string; senha: string;
    };

    const email = cpfParaEmail(cpf);
    const userRecord = await adminAuth.createUser({ email, password: senha, displayName: nome });

    const agora = FieldValue.serverTimestamp();
    await Promise.all([
      db.collection('admins').doc(userRecord.uid).set({
        nome, cpf, uid: userRecord.uid,
        criadoEm: agora, updatedAt: agora,
      }),
      db.collection('usuarios').doc(userRecord.uid).set({
        papel: 'admin', nome, status: 'ativo',
        criadoEm: agora, updatedAt: agora,
      }),
    ]);

    return { uid: userRecord.uid };
  },
);
