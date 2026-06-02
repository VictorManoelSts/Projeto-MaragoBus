import {
  getReservaAtiva,
  criarReserva,
  cancelarReserva,
  getReservasPorData,
} from '../services/reservas.service';
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Aluno } from '../types/Index';

jest.mock('../services/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc:             jest.fn(() => 'doc-ref'),
  collection:      jest.fn(() => 'col-ref'),
  setDoc:          jest.fn(),
  deleteDoc:       jest.fn(),
  getDoc:          jest.fn(),
  query:           jest.fn(() => 'query-ref'),
  where:           jest.fn(() => 'where-clause'),
  getDocs:         jest.fn(),
  serverTimestamp: jest.fn(() => 'TIMESTAMP'),
}));
jest.mock('../utils/dates', () => ({
  dataProximaViagem: jest.fn(() => '2025-05-15'),
  horaAtualStr:      jest.fn(() => '10:30'),
  dataAtual:         jest.fn(() => '2025-05-15'),
  dataAmanha:        jest.fn(() => '2025-05-16'),
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

// ─── getReservaAtiva ──────────────────────────────────────────────────────────

describe('getReservaAtiva', () => {
  it('retorna a reserva quando existe para a próxima viagem', async () => {
    jest.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id:     'aluno-1_2025-05-15',
      data:   () => ({ alunoId: 'aluno-1', data: '2025-05-15', confirmada: true }),
    } as any);

    const result = await getReservaAtiva('aluno-1');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'reservas', 'aluno-1_2025-05-15');
    expect(result).toMatchObject({ alunoId: 'aluno-1', data: '2025-05-15', confirmada: true });
  });

  it('retorna null quando não há reserva ativa', async () => {
    jest.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    expect(await getReservaAtiva('aluno-1')).toBeNull();
  });
});

// ─── criarReserva ─────────────────────────────────────────────────────────────

describe('criarReserva', () => {
  it('salva a reserva no Firestore com os dados denormalizados do aluno', async () => {
    jest.mocked(setDoc).mockResolvedValue(undefined);

    const aluno = makeAluno();
    await criarReserva(aluno);

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'reservas', 'aluno-1_2025-05-15');
    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({
        alunoId:       'aluno-1',
        data:          '2025-05-15',
        hora:          '10:30',
        confirmada:    true,
        nomeAluno:     'João Silva',
        faculdade:     'UFAL',
        curso:         'Direito',
        pontoEmbarque: 'Praça Central',
      }),
    );
  });

  it('retorna o objeto Reserva com os campos corretos', async () => {
    jest.mocked(setDoc).mockResolvedValue(undefined);

    const aluno  = makeAluno();
    const result = await criarReserva(aluno);

    expect(result).toMatchObject({
      id:            'aluno-1_2025-05-15',
      alunoId:       'aluno-1',
      data:          '2025-05-15',
      hora:          '10:30',
      confirmada:    true,
      nomeAluno:     'João Silva',
      faculdade:     'UFAL',
      semestreAtual: 3,
    });
  });

  it('o ID da reserva muda conforme o aluno', async () => {
    jest.mocked(setDoc).mockResolvedValue(undefined);

    await criarReserva(makeAluno({ id: 'aluno-99' }));

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'reservas', 'aluno-99_2025-05-15');
  });
});

// ─── cancelarReserva ──────────────────────────────────────────────────────────

describe('cancelarReserva', () => {
  it('exclui o documento da reserva ativa do aluno', async () => {
    jest.mocked(deleteDoc).mockResolvedValue(undefined);

    await cancelarReserva('aluno-1');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'reservas', 'aluno-1_2025-05-15');
    expect(deleteDoc).toHaveBeenCalledWith('doc-ref');
  });
});

// ─── getReservasPorData ───────────────────────────────────────────────────────

describe('getReservasPorData', () => {
  it('retorna todas as reservas de uma data específica', async () => {
    jest.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: 'a1_2025-05-15', data: () => ({ alunoId: 'a1', data: '2025-05-15' }) },
        { id: 'a2_2025-05-15', data: () => ({ alunoId: 'a2', data: '2025-05-15' }) },
      ],
    } as any);

    const result = await getReservasPorData('2025-05-15');

    expect(where).toHaveBeenCalledWith('data', '==', '2025-05-15');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'a1_2025-05-15', alunoId: 'a1' });
  });

  it('retorna array vazio quando não há reservas na data', async () => {
    jest.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    expect(await getReservasPorData('2025-05-15')).toEqual([]);
  });
});
