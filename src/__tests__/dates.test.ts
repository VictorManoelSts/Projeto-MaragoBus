import {
  toYMD,
  dataAtual,
  dataAmanha,
  dataProximaViagem,
  proximaSegunda,
} from '../utils/dates';

// Cria uma Date em hora LOCAL para evitar deslocamento UTC
function local(ano: number, mes: number, dia: number, hora = 0): Date {
  return new Date(ano, mes - 1, dia, hora, 0, 0, 0);
}

// Semana de referência: 12–18/05/2025
const SEG      = local(2025, 5, 12); // Segunda
const TER      = local(2025, 5, 13); // Terça
const QUA      = local(2025, 5, 14); // Quarta
const QUI      = local(2025, 5, 15); // Quinta
const SEX      = local(2025, 5, 16); // Sexta
const SAB      = local(2025, 5, 17); // Sábado
const DOM      = local(2025, 5, 18); // Domingo
const PROX_SEG = local(2025, 5, 19); // Segunda seguinte

// ─── toYMD ───────────────────────────────────────────────────────────────────

describe('toYMD', () => {
  it('formata data corretamente', () => {
    expect(toYMD(local(2025, 5, 16))).toBe('2025-05-16');
    expect(toYMD(local(2025, 1,  1))).toBe('2025-01-01');
    expect(toYMD(local(2025, 12, 31))).toBe('2025-12-31');
  });

  it('não sofre deslocamento UTC em horários noturnos', () => {
    // 23h no fuso UTC-3 seria 02h do dia seguinte em UTC — toYMD deve manter o dia local
    expect(toYMD(local(2025, 5, 16, 23))).toBe('2025-05-16');
    expect(toYMD(local(2025, 5, 17, 23))).toBe('2025-05-17');
    expect(toYMD(local(2025, 5, 18, 23))).toBe('2025-05-18');
  });
});

// ─── proximaSegunda ───────────────────────────────────────────────────────────

describe('proximaSegunda', () => {
  it('sexta → +3 dias (segunda)', () => {
    expect(toYMD(proximaSegunda(SEX))).toBe(toYMD(PROX_SEG));
  });

  it('sábado → +2 dias (segunda)', () => {
    expect(toYMD(proximaSegunda(SAB))).toBe(toYMD(PROX_SEG));
  });

  it('domingo → +1 dia (segunda)', () => {
    expect(toYMD(proximaSegunda(DOM))).toBe(toYMD(PROX_SEG));
  });

  it('funciona em horários noturnos sem deslocar o dia', () => {
    expect(toYMD(proximaSegunda(local(2025, 5, 16, 23)))).toBe(toYMD(PROX_SEG));
    expect(toYMD(proximaSegunda(local(2025, 5, 17, 23)))).toBe(toYMD(PROX_SEG));
    expect(toYMD(proximaSegunda(local(2025, 5, 18, 23)))).toBe(toYMD(PROX_SEG));
  });
});

// ─── dataAtual ────────────────────────────────────────────────────────────────

describe('dataAtual', () => {
  it('retorna a data de hoje no formato YYYY-MM-DD', () => {
    jest.useFakeTimers().setSystemTime(local(2025, 5, 16, 10));
    expect(dataAtual()).toBe('2025-05-16');
    jest.useRealTimers();
  });
});

// ─── dataAmanha ───────────────────────────────────────────────────────────────

describe('dataAmanha', () => {
  afterEach(() => jest.useRealTimers());

  const casos: [string, Date, string][] = [
    ['segunda → terça',   local(2025,5,12,17), '2025-05-13'],
    ['terça   → quarta',  local(2025,5,13,17), '2025-05-14'],
    ['quarta  → quinta',  local(2025,5,14,17), '2025-05-15'],
    ['quinta  → sexta',   local(2025,5,15,17), '2025-05-16'],
    ['sexta   → segunda', local(2025,5,16,17), '2025-05-19'],
    ['sábado  → segunda', local(2025,5,17,10), '2025-05-19'],
    ['domingo → segunda', local(2025,5,18,10), '2025-05-19'],
    ['sexta 23h → segunda', local(2025,5,16,23), '2025-05-19'],
  ];

  test.each(casos)('%s', (_, now, esperado) => {
    jest.useFakeTimers().setSystemTime(now);
    expect(dataAmanha()).toBe(esperado);
  });
});

// ─── dataProximaViagem ────────────────────────────────────────────────────────

describe('dataProximaViagem', () => {
  afterEach(() => jest.useRealTimers());

  describe('Seg–Qui antes das 17h → hoje', () => {
    const casos: [string, Date, string][] = [
      ['segunda 10h', local(2025,5,12,10), '2025-05-12'],
      ['terça   09h', local(2025,5,13, 9), '2025-05-13'],
      ['quarta  16h', local(2025,5,14,16), '2025-05-14'],
      ['quinta  16h', local(2025,5,15,16), '2025-05-15'],
    ];
    test.each(casos)('%s', (_, now, esperado) => {
      jest.useFakeTimers().setSystemTime(now);
      expect(dataProximaViagem()).toBe(esperado);
    });
  });

  describe('Seg–Qui a partir das 17h → próximo dia útil', () => {
    const casos: [string, Date, string][] = [
      ['segunda 17h → terça',  local(2025,5,12,17), '2025-05-13'],
      ['terça   17h → quarta', local(2025,5,13,17), '2025-05-14'],
      ['quarta  20h → quinta', local(2025,5,14,20), '2025-05-15'],
      ['quinta  17h → sexta',  local(2025,5,15,17), '2025-05-16'],
      ['quinta  23h → sexta',  local(2025,5,15,23), '2025-05-16'],
    ];
    test.each(casos)('%s', (_, now, esperado) => {
      jest.useFakeTimers().setSystemTime(now);
      expect(dataProximaViagem()).toBe(esperado);
    });
  });

  describe('Sexta antes das 17h → hoje (sexta)', () => {
    const casos: [string, Date, string][] = [
      ['sexta 09h', local(2025,5,16, 9), '2025-05-16'],
      ['sexta 16h', local(2025,5,16,16), '2025-05-16'],
    ];
    test.each(casos)('%s', (_, now, esperado) => {
      jest.useFakeTimers().setSystemTime(now);
      expect(dataProximaViagem()).toBe(esperado);
    });
  });

  describe('Sexta a partir das 17h → segunda-feira', () => {
    const casos: [string, Date, string][] = [
      ['sexta 17h', local(2025,5,16,17), '2025-05-19'],
      ['sexta 23h', local(2025,5,16,23), '2025-05-19'],
    ];
    test.each(casos)('%s', (_, now, esperado) => {
      jest.useFakeTimers().setSystemTime(now);
      expect(dataProximaViagem()).toBe(esperado);
    });
  });

  describe('Sábado (qualquer hora) → segunda-feira', () => {
    const casos: [string, Date, string][] = [
      ['sábado 00h', local(2025,5,17, 0), '2025-05-19'],
      ['sábado 12h', local(2025,5,17,12), '2025-05-19'],
      ['sábado 23h', local(2025,5,17,23), '2025-05-19'],
    ];
    test.each(casos)('%s', (_, now, esperado) => {
      jest.useFakeTimers().setSystemTime(now);
      expect(dataProximaViagem()).toBe(esperado);
    });
  });

  describe('Domingo (qualquer hora) → segunda-feira', () => {
    const casos: [string, Date, string][] = [
      ['domingo 00h', local(2025,5,18, 0), '2025-05-19'],
      ['domingo 10h', local(2025,5,18,10), '2025-05-19'],
      ['domingo 23h', local(2025,5,18,23), '2025-05-19'],
    ];
    test.each(casos)('%s', (_, now, esperado) => {
      jest.useFakeTimers().setSystemTime(now);
      expect(dataProximaViagem()).toBe(esperado);
    });
  });

  it('limite exato: quinta 16h59 → hoje / quinta 17h00 → sexta', () => {
    jest.useFakeTimers().setSystemTime(local(2025, 5, 15, 16));
    expect(dataProximaViagem()).toBe('2025-05-15');

    jest.useFakeTimers().setSystemTime(local(2025, 5, 15, 17));
    expect(dataProximaViagem()).toBe('2025-05-16');
  });

  it('limite exato: sexta 16h → hoje / sexta 17h → segunda', () => {
    jest.useFakeTimers().setSystemTime(local(2025, 5, 16, 16));
    expect(dataProximaViagem()).toBe('2025-05-16');

    jest.useFakeTimers().setSystemTime(local(2025, 5, 16, 17));
    expect(dataProximaViagem()).toBe('2025-05-19');
  });
});
