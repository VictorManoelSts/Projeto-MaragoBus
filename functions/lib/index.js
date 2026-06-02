"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarAdmin = exports.excluirMotorista = exports.excluirAluno = exports.criarMotorista = exports.criarAluno = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
const adminAuth = (0, auth_1.getAuth)();
const db = (0, firestore_1.getFirestore)();
// ─── Helpers ─────────────────────────────────────────────────────────────────
function cpfParaEmail(cpf) {
    return `${cpf.replace(/\D/g, '')}@maragobus.internal`;
}
async function assertAdmin(uid) {
    const snap = await db.collection('usuarios').doc(uid).get();
    if (!snap.exists || snap.data()?.papel !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Apenas administradores podem realizar esta ação.');
    }
}
// ─── criarAluno ──────────────────────────────────────────────────────────────
// Cria o usuário no Firebase Auth e salva os dados no Firestore.
// Requer que o chamador seja um admin autenticado.
exports.criarAluno = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);
    const { nome, cpf, senha, telefone, endereco, faculdade, curso, modalidade, semestreAtual, anoConclusao, pontoEmbarque, } = request.data;
    const email = cpfParaEmail(cpf);
    // Verifica CPF duplicado antes de criar
    try {
        await adminAuth.getUserByEmail(email);
        throw new https_1.HttpsError('already-exists', 'Já existe um aluno com este CPF.');
    }
    catch (err) {
        if (err.code !== 'auth/user-not-found')
            throw err;
    }
    const userRecord = await adminAuth.createUser({
        email,
        password: senha,
        displayName: nome,
    });
    const agora = firestore_1.FieldValue.serverTimestamp();
    const alunoData = {
        nome, cpf, telefone, endereco,
        faculdade, curso, modalidade,
        semestreAtual: Number(semestreAtual),
        anoConclusao: Number(anoConclusao),
        pontoEmbarque,
        foto: null,
        status: 'ativo',
        advertencias: 0,
        uid: userRecord.uid,
        criadoEm: agora,
        updatedAt: agora,
    };
    await Promise.all([
        db.collection('alunos').doc(userRecord.uid).set(alunoData),
        db.collection('usuarios').doc(userRecord.uid).set({
            papel: 'aluno', nome, status: 'ativo',
            criadoEm: agora, updatedAt: agora,
        }),
    ]);
    return { uid: userRecord.uid };
});
// ─── criarMotorista ──────────────────────────────────────────────────────────
// Cria usuário com papel 'motorista'.
exports.criarMotorista = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);
    const { nome, cpf, senha, telefone } = request.data;
    const email = cpfParaEmail(cpf);
    try {
        await adminAuth.getUserByEmail(email);
        throw new https_1.HttpsError('already-exists', 'Já existe um motorista com este CPF.');
    }
    catch (err) {
        if (err.code !== 'auth/user-not-found')
            throw err;
    }
    const userRecord = await adminAuth.createUser({
        email,
        password: senha,
        displayName: nome,
    });
    const agora = firestore_1.FieldValue.serverTimestamp();
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
});
// ─── excluirAluno ────────────────────────────────────────────────────────────
// Remove o aluno do Firebase Auth e do Firestore.
exports.excluirAluno = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);
    const { alunoId } = request.data;
    await Promise.all([
        db.collection('alunos').doc(alunoId).delete(),
        db.collection('usuarios').doc(alunoId).delete(),
        adminAuth.deleteUser(alunoId).catch(() => { }), // ignora se já não existir
    ]);
    return { success: true };
});
// ─── excluirMotorista ─────────────────────────────────────────────────────────
// Remove o motorista do Firebase Auth e do Firestore.
exports.excluirMotorista = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Não autenticado.');
    await assertAdmin(request.auth.uid);
    const { motoristaId } = request.data;
    await Promise.all([
        db.collection('motoristas').doc(motoristaId).delete(),
        db.collection('usuarios').doc(motoristaId).delete(),
        adminAuth.deleteUser(motoristaId).catch(() => { }),
    ]);
    return { success: true };
});
// ─── criarAdmin ──────────────────────────────────────────────────────────────
// Use apenas uma vez no setup inicial via Firebase Console ou CLI.
// Após criar o primeiro admin, remova ou proteja este endpoint.
exports.criarAdmin = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    // Só permite se ainda não há admins cadastrados
    const adminsSnap = await db
        .collection('usuarios')
        .where('papel', '==', 'admin')
        .limit(1)
        .get();
    if (!adminsSnap.empty) {
        throw new https_1.HttpsError('permission-denied', 'Já existe um admin cadastrado. Use o Firebase Console para criar novos admins.');
    }
    const { nome, cpf, senha } = request.data;
    const email = cpfParaEmail(cpf);
    const userRecord = await adminAuth.createUser({ email, password: senha, displayName: nome });
    const agora = firestore_1.FieldValue.serverTimestamp();
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
});
//# sourceMappingURL=index.js.map