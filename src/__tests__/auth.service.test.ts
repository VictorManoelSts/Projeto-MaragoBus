import { login, logout, onAuthChange } from '../services/auth.service';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

jest.mock('../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut:                    jest.fn(),
  onAuthStateChanged:         jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc:    jest.fn(),
  getDoc: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('retorna uid e papel quando as credenciais são válidas', async () => {
    jest.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'uid-1' } } as any);
    jest.mocked(doc).mockReturnValue('ref' as any);
    jest.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data:   () => ({ papel: 'aluno' }),
    } as any);

    const result = await login('12345678901', 'senha123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      '12345678901@maragobus.internal',
      'senha123',
    );
    expect(result).toEqual({ uid: 'uid-1', papel: 'aluno' });
  });

  it('converte CPF com pontuação em e-mail antes de autenticar', async () => {
    jest.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'uid-1' } } as any);
    jest.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data:   () => ({ papel: 'admin' }),
    } as any);

    await login('123.456.789-01', 'senha');

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      '12345678901@maragobus.internal',
      'senha',
    );
  });

  it('lança erro quando o usuário não existe no Firestore', async () => {
    jest.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'uid-1' } } as any);
    jest.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

    await expect(login('12345678901', 'senha')).rejects.toThrow(
      'Usuário não encontrado no sistema.',
    );
  });

  it('propaga erro do Firebase Auth sem modificação', async () => {
    const erro = new Error('auth/wrong-password');
    jest.mocked(signInWithEmailAndPassword).mockRejectedValue(erro);

    await expect(login('12345678901', 'errada')).rejects.toThrow('auth/wrong-password');
  });

  it('funciona para papel motorista e admin', async () => {
    for (const papel of ['motorista', 'admin'] as const) {
      jest.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'uid-x' } } as any);
      jest.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data:   () => ({ papel }),
      } as any);

      const result = await login('00000000000', 'senha');
      expect(result.papel).toBe(papel);
    }
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('chama signOut uma vez', async () => {
    jest.mocked(signOut).mockResolvedValue(undefined);
    await logout();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

// ─── onAuthChange ─────────────────────────────────────────────────────────────

describe('onAuthChange', () => {
  it('registra o callback e retorna a função de cancelamento', () => {
    const unsub = jest.fn();
    jest.mocked(onAuthStateChanged).mockReturnValue(unsub as any);

    const cb  = jest.fn();
    const ret = onAuthChange(cb);

    expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), cb);
    expect(ret).toBe(unsub);
  });
});
