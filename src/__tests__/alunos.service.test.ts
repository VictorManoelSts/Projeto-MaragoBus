import {
  getAlunos,
  getAluno,
  getAlunosByIds,
  updateAluno,
  aplicarAdvertencia,
  alternarStatus,
  excluirAluno,
  criarAluno,
} from '../services/alunos.service';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { Aluno } from '../types/Index';

jest.mock('../services/firebase', () => ({ db: {}, functions: {} }));
jest.mock('firebase/firestore', () => ({
  collection:      jest.fn(() => 'col-ref'),
  doc:             jest.fn(() => 'doc-ref'),
  getDocs:         jest.fn(),
  getDoc:          jest.fn(),
  updateDoc:       jest.fn(),
  setDoc:          jest.fn(),
  query:           jest.fn(() => 'query-ref'),
  where:           jest.fn(() => 'where-clause'),
  serverTimestamp: jest.fn(() => 'TIMESTAMP'),
}));
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

// ─── Fixture ──────────────────────────────────────────────────────────────────

function makeAluno(overrides: Partial<Aluno> = {}): Aluno {
  return {
    id: 'aluno-1', nome: 'João Silva', cpf: '12345678901', foto: null,
    telefone: '(82) 99999-0000', endereco: 'Rua A, 1', faculdade: 'UFAL',
    curso: 'Direito', modalidade: 'Presencial', semestreAtual: 3,
    anoConclusao: 2026, pontoEmbarque: 'Praça Central',
    status: 'ativo', advertencias: 0,
    ...overrides,
  };
}

function makeSnap(data: object, id = 'aluno-1') {
  return { id, data: () => data, exists: () => true };
}

// ─── getAlunos ────────────────────────────────────────────────────────────────

describe('getAlunos', () => {
  it('retorna lista mapeada de alunos', async () => {
    jest.mocked(getDocs).mockResolvedValue({
      docs: [makeSnap({ nome: 'João', status: 'ativo' }), makeSnap({ nome: 'Maria', status: 'suspenso' }, 'aluno-2')],
    } as any);

    const result = await getAlunos();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'aluno-1', nome: 'João' });
    expect(result[1]).toMatchObject({ id: 'aluno-2', nome: 'Maria' });
  });

  it('retorna lista vazia quando não há alunos', async () => {
    jest.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    expect(await getAlunos()).toEqual([]);
  });
});

// ─── getAluno ─────────────────────────────────────────────────────────────────

describe('getAluno', () => {
  it('retorna o aluno quando o documento existe', async () => {
    jest.mocked(getDoc).mockResolvedValue(makeSnap({ nome: 'João', status: 'ativo' }) as any);

    const result = await getAluno('aluno-1');

    expect(result).toMatchObject({ id: 'aluno-1', nome: 'João' });
  });

  it('retorna null quando o documento não existe', async () => {
    jest.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    expect(await getAluno('inexistente')).toBeNull();
  });
});

// ─── getAlunosByIds ───────────────────────────────────────────────────────────

describe('getAlunosByIds', () => {
  it('retorna array vazio para lista de IDs vazia', async () => {
    expect(await getAlunosByIds([])).toEqual([]);
    expect(getDocs).not.toHaveBeenCalled();
  });

  it('faz uma única query para menos de 10 IDs', async () => {
    const ids = ['a1', 'a2', 'a3'];
    jest.mocked(getDocs).mockResolvedValue({
      docs: ids.map((id) => makeSnap({ nome: `Aluno ${id}` }, id)),
    } as any);

    const result = await getAlunosByIds(ids);

    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(3);
  });

  it('divide em lotes de 10 quando há mais de 10 IDs', async () => {
    const ids = Array.from({ length: 11 }, (_, i) => `id-${i}`);

    jest.mocked(getDocs)
      .mockResolvedValueOnce({ docs: ids.slice(0, 10).map((id) => makeSnap({}, id)) } as any)
      .mockResolvedValueOnce({ docs: [makeSnap({}, ids[10])] } as any);

    const result = await getAlunosByIds(ids);

    expect(getDocs).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(11);
  });
});

// ─── updateAluno ──────────────────────────────────────────────────────────────

describe('updateAluno', () => {
  it('chama updateDoc com os dados e updatedAt', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);

    await updateAluno('aluno-1', { nome: 'Novo Nome' });

    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ nome: 'Novo Nome', updatedAt: 'TIMESTAMP' }),
    );
  });
});

// ─── aplicarAdvertencia ───────────────────────────────────────────────────────

describe('aplicarAdvertencia', () => {
  it('incrementa advertências e não suspende antes do limite', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    jest.mocked(setDoc).mockResolvedValue(undefined);

    const aluno  = makeAluno({ advertencias: 1 });
    const result = await aplicarAdvertencia(aluno);

    expect(result.advertencias).toBe(2);
    expect(result.status).toBe('ativo');
  });

  it('suspende automaticamente ao atingir 3 advertências', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    jest.mocked(setDoc).mockResolvedValue(undefined);

    const aluno  = makeAluno({ advertencias: 2 });
    const result = await aplicarAdvertencia(aluno);

    expect(result.advertencias).toBe(3);
    expect(result.status).toBe('suspenso');
  });

  it('registra log de advertência no Firestore', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    jest.mocked(setDoc).mockResolvedValue(undefined);

    const aluno = makeAluno({ advertencias: 0 });
    await aplicarAdvertencia(aluno);

    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ alunoId: aluno.id, numero: 1 }),
    );
  });

  it('não altera o objeto original', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    jest.mocked(setDoc).mockResolvedValue(undefined);

    const aluno = makeAluno({ advertencias: 1 });
    await aplicarAdvertencia(aluno);

    expect(aluno.advertencias).toBe(1);
  });
});

// ─── alternarStatus ───────────────────────────────────────────────────────────

describe('alternarStatus', () => {
  it('muda de ativo para suspenso', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    const result = await alternarStatus(makeAluno({ status: 'ativo' }));
    expect(result.status).toBe('suspenso');
  });

  it('muda de suspenso para ativo', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    const result = await alternarStatus(makeAluno({ status: 'suspenso' }));
    expect(result.status).toBe('ativo');
  });

  it('persiste o novo status no Firestore', async () => {
    jest.mocked(updateDoc).mockResolvedValue(undefined);
    await alternarStatus(makeAluno({ status: 'ativo' }));
    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ status: 'suspenso' }),
    );
  });
});

// ─── excluirAluno ─────────────────────────────────────────────────────────────

describe('excluirAluno', () => {
  it('chama a Cloud Function excluirAluno com o id correto', async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: {} });
    jest.mocked(httpsCallable).mockReturnValue(mockFn as any);

    await excluirAluno('aluno-42');

    expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'excluirAluno');
    expect(mockFn).toHaveBeenCalledWith({ alunoId: 'aluno-42' });
  });
});

// ─── criarAluno ───────────────────────────────────────────────────────────────

describe('criarAluno', () => {
  it('chama a Cloud Function criarAluno e retorna o uid', async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: { uid: 'novo-uid' } });
    jest.mocked(httpsCallable).mockReturnValue(mockFn as any);

    const dados = {
      nome: 'Ana', cpf: '11111111111', senha: 'abc123',
      telefone: '(82) 99999-0000', endereco: 'Rua B', faculdade: 'UFAL',
      curso: 'Medicina', modalidade: 'Presencial', semestreAtual: 1,
      anoConclusao: 2030, pontoEmbarque: 'Posto Shell',
    };

    const result = await criarAluno(dados);

    expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'criarAluno');
    expect(mockFn).toHaveBeenCalledWith(dados);
    expect(result).toEqual({ uid: 'novo-uid' });
  });
});
