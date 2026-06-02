import { getIniciais, formatarCPF, formatarTelefone } from '../constants/appData';

// ─── getIniciais ──────────────────────────────────────────────────────────────

describe('getIniciais', () => {
  it('retorna as duas primeiras iniciais', () => {
    expect(getIniciais('João Silva')).toBe('JS');
    expect(getIniciais('Maria Eduarda')).toBe('ME');
  });

  it('retorna uma única inicial para nome com uma palavra', () => {
    expect(getIniciais('João')).toBe('J');
  });

  it('usa apenas as duas primeiras palavras mesmo com nome composto', () => {
    expect(getIniciais('José Carlos da Silva')).toBe('JC');
    expect(getIniciais('Ana Paula de Souza')).toBe('AP');
  });

  it('retorna maiúsculo independente do input', () => {
    expect(getIniciais('joão silva')).toBe('JS');
    expect(getIniciais('MARIA EDUARDA')).toBe('ME');
  });

  it('ignora espaços extras', () => {
    expect(getIniciais('  João   Silva  ')).toBe('JS');
  });

  it('retorna string vazia para nome vazio', () => {
    expect(getIniciais('')).toBe('');
  });
});

// ─── formatarCPF ─────────────────────────────────────────────────────────────

describe('formatarCPF', () => {
  it('formata CPF completo (11 dígitos)', () => {
    expect(formatarCPF('12345678901')).toBe('123.456.789-01');
  });

  it('aceita CPF já formatado como entrada', () => {
    expect(formatarCPF('123.456.789-01')).toBe('123.456.789-01');
  });

  it('formata parcialmente conforme o usuário digita', () => {
    expect(formatarCPF('1')).toBe('1');
    expect(formatarCPF('123')).toBe('123');
    expect(formatarCPF('1234')).toBe('123.4');
    expect(formatarCPF('123456')).toBe('123.456');
    expect(formatarCPF('1234567')).toBe('123.456.7');
    expect(formatarCPF('123456789')).toBe('123.456.789');
    expect(formatarCPF('1234567890')).toBe('123.456.789-0');
  });

  it('trunca em 11 dígitos', () => {
    expect(formatarCPF('123456789012345')).toBe('123.456.789-01');
  });

  it('retorna vazio para entrada vazia', () => {
    expect(formatarCPF('')).toBe('');
  });

  it('remove caracteres não numéricos antes de formatar', () => {
    expect(formatarCPF('abc123def456ghi789-01')).toBe('123.456.789-01');
  });
});

// ─── formatarTelefone ─────────────────────────────────────────────────────────

describe('formatarTelefone', () => {
  it('formata celular completo (11 dígitos)', () => {
    expect(formatarTelefone('82999990000')).toBe('(82) 99999-0000');
  });

  it('formata telefone fixo (10 dígitos)', () => {
    expect(formatarTelefone('8233330000')).toBe('(82) 3333-0000');
  });

  it('aceita entrada já formatada', () => {
    expect(formatarTelefone('(82) 99999-0000')).toBe('(82) 99999-0000');
  });

  it('formata parcialmente conforme o usuário digita', () => {
    expect(formatarTelefone('')).toBe('');
    expect(formatarTelefone('8')).toBe('(8');
    expect(formatarTelefone('82')).toBe('(82');
    expect(formatarTelefone('829')).toBe('(82) 9');
    expect(formatarTelefone('8299999')).toBe('(82) 99999');
    expect(formatarTelefone('82999990')).toBe('(82) 9999-90');
    expect(formatarTelefone('829999900')).toBe('(82) 9999-900');
  });

  it('trunca em 11 dígitos', () => {
    expect(formatarTelefone('829999900001234')).toBe('(82) 99999-0000');
  });
});
