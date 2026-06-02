import { cpfParaEmail } from '../utils/auth';
import { calcularAdvertencia, calcularNovoStatus, LIMITE_ADVERTENCIAS } from '../utils/alunos';
import type { Aluno } from '../types/Index';

// ─── Fixture ──────────────────────────────────────────────────────────────────

function makeAluno(overrides: Partial<Aluno> = {}): Aluno {
  return {
    id:            'aluno-1',
    nome:          'João Silva',
    cpf:           '123.456.789-01',
    foto:          null,
    telefone:      '(82) 99999-0000',
    endereco:      'Rua A, 1',
    faculdade:     'UFAL',
    curso:         'Direito',
    modalidade:    'Presencial',
    semestreAtual: 3,
    anoConclusao:  2026,
    pontoEmbarque: 'Praça Central',
    status:        'ativo',
    advertencias:  0,
    ...overrides,
  };
}

// ─── cpfParaEmail ─────────────────────────────────────────────────────────────

describe('cpfParaEmail', () => {
  it('converte CPF formatado para e-mail interno', () => {
    expect(cpfParaEmail('123.456.789-01')).toBe('12345678901@maragobus.internal');
  });

  it('converte CPF sem formatação para e-mail interno', () => {
    expect(cpfParaEmail('12345678901')).toBe('12345678901@maragobus.internal');
  });

  it('remove qualquer caractere não numérico', () => {
    expect(cpfParaEmail('123 456 789 01')).toBe('12345678901@maragobus.internal');
  });

  it('e-mail gerado bate com o domínio correto', () => {
    const email = cpfParaEmail('12345678901');
    expect(email).toMatch(/@maragobus\.internal$/);
  });
});

// ─── calcularAdvertencia ──────────────────────────────────────────────────────

describe('calcularAdvertencia', () => {
  it(`suspende automaticamente ao atingir ${LIMITE_ADVERTENCIAS} advertências`, () => {
    const aluno = makeAluno({ advertencias: LIMITE_ADVERTENCIAS - 1 });
    const patch = calcularAdvertencia(aluno);
    expect(patch.advertencias).toBe(LIMITE_ADVERTENCIAS);
    expect(patch.status).toBe('suspenso');
  });

  it('não suspende antes de atingir o limite', () => {
    const patch1 = calcularAdvertencia(makeAluno({ advertencias: 0 }));
    expect(patch1.advertencias).toBe(1);
    expect(patch1.status).toBeUndefined();

    const patch2 = calcularAdvertencia(makeAluno({ advertencias: 1 }));
    expect(patch2.advertencias).toBe(2);
    expect(patch2.status).toBeUndefined();
  });

  it('incrementa em 1 independentemente do valor atual', () => {
    expect(calcularAdvertencia(makeAluno({ advertencias: 0 })).advertencias).toBe(1);
    expect(calcularAdvertencia(makeAluno({ advertencias: 1 })).advertencias).toBe(2);
    expect(calcularAdvertencia(makeAluno({ advertencias: 5 })).advertencias).toBe(6);
  });

  it('não modifica o objeto original', () => {
    const aluno = makeAluno({ advertencias: 1 });
    calcularAdvertencia(aluno);
    expect(aluno.advertencias).toBe(1);
    expect(aluno.status).toBe('ativo');
  });
});

// ─── calcularNovoStatus ───────────────────────────────────────────────────────

describe('calcularNovoStatus', () => {
  it('ativo → suspenso', () => {
    expect(calcularNovoStatus('ativo')).toBe('suspenso');
  });

  it('suspenso → ativo', () => {
    expect(calcularNovoStatus('suspenso')).toBe('ativo');
  });

  it('é uma operação de toggle (dois passos volta ao estado original)', () => {
    const original = 'ativo';
    const invertido = calcularNovoStatus(original);
    expect(calcularNovoStatus(invertido)).toBe(original);
  });
});
