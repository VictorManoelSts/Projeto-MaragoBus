import { getAdmin, criarAdmin } from '../services/admins.service';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

jest.mock('../services/firebase', () => ({ db: {}, functions: {} }));
jest.mock('firebase/firestore', () => ({
  doc:    jest.fn(() => 'doc-ref'),
  getDoc: jest.fn(),
}));
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

// ─── getAdmin ─────────────────────────────────────────────────────────────────

describe('getAdmin', () => {
  it('retorna o admin quando o documento existe na coleção admins', async () => {
    jest.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id:     'uid-1',
      data:   () => ({ nome: 'Victor', cpf: '12345678901', uid: 'uid-1' }),
    } as any);

    const result = await getAdmin('uid-1');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'admins', 'uid-1');
    expect(result).toMatchObject({ id: 'uid-1', nome: 'Victor', cpf: '12345678901' });
  });

  it('usa o fallback em usuarios quando não existe em admins', async () => {
    jest.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => false } as any)
      .mockResolvedValueOnce({
        exists: () => true,
        data:   () => ({ nome: 'Victor', cpf: '12357035412', papel: 'admin' }),
      } as any);

    const result = await getAdmin('uid-1');

    expect(getDoc).toHaveBeenCalledTimes(2);
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'usuarios', 'uid-1');
    expect(result).toMatchObject({ id: 'uid-1', nome: 'Victor', cpf: '12357035412' });
  });

  it('usa valores padrão quando o fallback não tem nome ou cpf', async () => {
    jest.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => false } as any)
      .mockResolvedValueOnce({
        exists: () => true,
        data:   () => ({ papel: 'admin' }),
      } as any);

    const result = await getAdmin('uid-1');

    expect(result).toMatchObject({ nome: 'Admin', cpf: '' });
  });

  it('retorna null quando não existe em nenhuma coleção', async () => {
    jest.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => false } as any)
      .mockResolvedValueOnce({ exists: () => false } as any);

    expect(await getAdmin('inexistente')).toBeNull();
  });
});

// ─── criarAdmin ───────────────────────────────────────────────────────────────

describe('criarAdmin', () => {
  it('chama a Cloud Function criarAdmin e retorna o uid', async () => {
    const mockFn = jest.fn().mockResolvedValue({ data: { uid: 'admin-uid' } });
    jest.mocked(httpsCallable).mockReturnValue(mockFn as any);

    const dados = { nome: 'Victor', cpf: '12357035412', senha: 'V1ct0r2308' };
    const result = await criarAdmin(dados);

    expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'criarAdmin');
    expect(mockFn).toHaveBeenCalledWith(dados);
    expect(result).toEqual({ uid: 'admin-uid' });
  });
});
