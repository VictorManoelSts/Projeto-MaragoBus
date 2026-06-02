import type { Aluno, StatusAluno } from '../types/Index';

// Suspensão automática ao atingir 3 advertências
export const LIMITE_ADVERTENCIAS = 3;

/** Calcula o patch de advertência sem tocar no Firebase */
export function calcularAdvertencia(aluno: Aluno): Partial<Aluno> {
  const advertencias = aluno.advertencias + 1;
  const suspenso     = advertencias >= LIMITE_ADVERTENCIAS;
  return {
    advertencias,
    ...(suspenso ? { status: 'suspenso' as StatusAluno } : {}),
  };
}

/** Retorna o status alternado sem tocar no Firebase */
export function calcularNovoStatus(status: StatusAluno): StatusAluno {
  return status === 'suspenso' ? 'ativo' : 'suspenso';
}
