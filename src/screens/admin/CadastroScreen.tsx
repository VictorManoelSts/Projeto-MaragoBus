import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { Input, SelectInput } from '../../components/Input';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import {
  FACULDADES, CURSOS, PONTOS_EMBARQUE, MODALIDADES, formatarCPF, formatarTelefone,
} from '../../constants/appData';
import { criarAluno } from '../../services/alunos.service';
import { criarMotorista } from '../../services/motoristas.service';
import type { Modalidade } from '../../types/Index';

// ─── Tipos de formulário ──────────────────────────────────────────────────────

type TipoCadastro = 'aluno' | 'motorista';

// ─── Form state — Aluno ───────────────────────────────────────────────────────

interface AlunoForm {
  nome: string; cpf: string; senha: string; telefone: string; endereco: string;
  faculdade: string; curso: string; modalidade: Modalidade | '';
  semestreAtual: string; anoConclusao: string; pontoEmbarque: string;
}

const EMPTY_ALUNO: AlunoForm = {
  nome: '', cpf: '', senha: '', telefone: '', endereco: '',
  faculdade: '', curso: '', modalidade: '',
  semestreAtual: '', anoConclusao: '', pontoEmbarque: '',
};

// ─── Form state — Motorista ───────────────────────────────────────────────────

interface MotoristaForm {
  nome: string; cpf: string; senha: string; telefone: string;
}

const EMPTY_MOTORISTA: MotoristaForm = { nome: '', cpf: '', senha: '', telefone: '' };

// ─── Componente principal ─────────────────────────────────────────────────────

export const CadastroScreen: React.FC = () => {
  const [tipo, setTipo] = useState<TipoCadastro>('aluno');

  const mudarTipo = (t: TipoCadastro) => {
    setTipo(t);
    setAlunoForm(EMPTY_ALUNO);
    setAlunoErrors({});
    setMotoristaForm(EMPTY_MOTORISTA);
    setMotoristaErrors({});
    setSucesso(false);
  };

  // ── Estado compartilhado ──────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false);
  const [sucesso, setSucesso]   = useState(false);

  // ── Estado — Aluno ────────────────────────────────────────────────────────
  const [alunoForm, setAlunoForm]     = useState<AlunoForm>(EMPTY_ALUNO);
  const [alunoErrors, setAlunoErrors] = useState<Partial<Record<keyof AlunoForm, string>>>({});

  const setAluno = (key: keyof AlunoForm) => (val: string) =>
    setAlunoForm((prev) => ({ ...prev, [key]: val }));

  const validarAluno = (): boolean => {
    const errs: typeof alunoErrors = {};
    if (!alunoForm.nome.trim())                              errs.nome          = 'Nome obrigatório';
    if (alunoForm.cpf.replace(/\D/g, '').length < 11)       errs.cpf           = 'CPF inválido';
    if (alunoForm.senha.length < 6)                          errs.senha         = 'Senha deve ter pelo menos 6 caracteres';
    if (!alunoForm.faculdade)                                errs.faculdade     = 'Selecione a faculdade';
    if (!alunoForm.curso)                                    errs.curso         = 'Selecione o curso';
    if (!alunoForm.modalidade)                               errs.modalidade    = 'Selecione a modalidade';
    if (!alunoForm.pontoEmbarque)                            errs.pontoEmbarque = 'Selecione o ponto';
    const sem = Number(alunoForm.semestreAtual);
    if (!sem || sem < 1 || sem > 12)                         errs.semestreAtual = 'Semestre inválido (1–12)';
    const ano = Number(alunoForm.anoConclusao);
    if (!ano || ano < 2024)                                  errs.anoConclusao  = 'Ano de conclusão inválido';
    setAlunoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvarAluno = async () => {
    if (!validarAluno()) return;
    setLoading(true);
    try {
      await criarAluno({
        nome:          alunoForm.nome.trim(),
        cpf:           alunoForm.cpf,
        senha:         alunoForm.senha,
        telefone:      alunoForm.telefone.trim(),
        endereco:      alunoForm.endereco.trim(),
        faculdade:     alunoForm.faculdade,
        curso:         alunoForm.curso,
        modalidade:    alunoForm.modalidade as Modalidade,
        semestreAtual: Number(alunoForm.semestreAtual),
        anoConclusao:  Number(alunoForm.anoConclusao),
        pontoEmbarque: alunoForm.pontoEmbarque,
      });
      setSucesso(true);
      setAlunoForm(EMPTY_ALUNO);
      setAlunoErrors({});
      setTimeout(() => setSucesso(false), 4000);
    } catch (err: any) {
      const msg =
        err.code === 'functions/already-exists'
          ? 'Já existe um cadastro com esse CPF.'
          : err.message ?? 'Erro ao cadastrar. Verifique sua conexão.';
      Alert.alert('Erro no cadastro', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Estado — Motorista ────────────────────────────────────────────────────
  const [motoristaForm, setMotoristaForm]     = useState<MotoristaForm>(EMPTY_MOTORISTA);
  const [motoristaErrors, setMotoristaErrors] = useState<Partial<Record<keyof MotoristaForm, string>>>({});

  const setMotorista = (key: keyof MotoristaForm) => (val: string) =>
    setMotoristaForm((prev) => ({ ...prev, [key]: val }));

  const validarMotorista = (): boolean => {
    const errs: typeof motoristaErrors = {};
    if (!motoristaForm.nome.trim())                          errs.nome     = 'Nome obrigatório';
    if (motoristaForm.cpf.replace(/\D/g, '').length < 11)   errs.cpf      = 'CPF inválido';
    if (motoristaForm.senha.length < 6)                      errs.senha    = 'Senha deve ter pelo menos 6 caracteres';
    setMotoristaErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvarMotorista = async () => {
    if (!validarMotorista()) return;
    setLoading(true);
    try {
      await criarMotorista({
        nome:     motoristaForm.nome.trim(),
        cpf:      motoristaForm.cpf,
        senha:    motoristaForm.senha,
        telefone: motoristaForm.telefone.trim(),
      });
      setSucesso(true);
      setMotoristaForm(EMPTY_MOTORISTA);
      setMotoristaErrors({});
      setTimeout(() => setSucesso(false), 4000);
    } catch (err: any) {
      const msg =
        err.code === 'functions/already-exists'
          ? 'Já existe um motorista com esse CPF.'
          : err.message ?? 'Erro ao cadastrar. Verifique sua conexão.';
      Alert.alert('Erro no cadastro', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Seletor de tipo ────────────────────────────────── */}
        <View style={styles.segmentWrap}>
          <TouchableOpacity
            onPress={() => mudarTipo('aluno')}
            activeOpacity={0.8}
            style={[styles.segBtn, tipo === 'aluno' && styles.segBtnActive]}
          >
            <Text style={[styles.segTxt, tipo === 'aluno' && styles.segTxtActive]}>
              👤 Aluno
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => mudarTipo('motorista')}
            activeOpacity={0.8}
            style={[styles.segBtn, tipo === 'motorista' && styles.segBtnActive]}
          >
            <Text style={[styles.segTxt, tipo === 'motorista' && styles.segTxtActive]}>
              🚌 Motorista
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Banner de sucesso ───────────────────────────────── */}
        {sucesso && (
          <View style={styles.successBanner}>
            <Text style={styles.successTxt}>
              {tipo === 'aluno' ? '✅ Aluno cadastrado com sucesso!' : '✅ Motorista cadastrado com sucesso!'}
            </Text>
          </View>
        )}

        {/* ── Formulário — Aluno ──────────────────────────────── */}
        {tipo === 'aluno' && (
          <View style={[styles.card, Shadow.card]}>
            <Text style={styles.secTitle}>👤 Dados Pessoais</Text>

            <Input
              label="Nome completo *"
              value={alunoForm.nome}
              onChangeText={setAluno('nome')}
              placeholder="Nome completo do aluno"
              error={alunoErrors.nome}
            />
            <Input
              label="CPF *"
              value={alunoForm.cpf}
              onChangeText={(t) => setAluno('cpf')(formatarCPF(t))}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              error={alunoErrors.cpf}
            />
            <Input
              label="Senha inicial *"
              value={alunoForm.senha}
              onChangeText={setAluno('senha')}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={alunoErrors.senha}
              note="O aluno usará esta senha para o primeiro acesso."
            />
            <Input
              label="Telefone"
              value={alunoForm.telefone}
              onChangeText={(t) => setAluno('telefone')(formatarTelefone(t))}
              placeholder="(82) 99999-0000"
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Input
              label="Endereço"
              value={alunoForm.endereco}
              onChangeText={setAluno('endereco')}
              placeholder="Rua, número, bairro"
            />

            <Divider vertical={Spacing.lg} />
            <Text style={styles.secTitle}>🏫 Dados Acadêmicos</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Faculdade *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                {FACULDADES.map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setAluno('faculdade')(f)}
                    style={[styles.chip, alunoForm.faculdade === f && styles.chipActive]}
                  >
                    <Text style={[styles.chipTxt, alunoForm.faculdade === f && styles.chipTxtActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {alunoErrors.faculdade && <Text style={styles.errorTxt}>{alunoErrors.faculdade}</Text>}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Curso *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                {CURSOS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setAluno('curso')(c)}
                    style={[styles.chip, alunoForm.curso === c && styles.chipActive]}
                  >
                    <Text style={[styles.chipTxt, alunoForm.curso === c && styles.chipTxtActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {alunoErrors.curso && <Text style={styles.errorTxt}>{alunoErrors.curso}</Text>}
            </View>

            <SelectInput
              label="Modalidade de ensino *"
              value={alunoForm.modalidade}
              options={[...MODALIDADES]}
              onChange={(v) => setAluno('modalidade')(v as Modalidade)}
            />
            {alunoErrors.modalidade && (
              <Text style={[styles.errorTxt, { marginTop: -10, marginBottom: 10 }]}>
                {alunoErrors.modalidade}
              </Text>
            )}

            <View style={styles.duoRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Semestre atual *"
                  value={alunoForm.semestreAtual}
                  onChangeText={setAluno('semestreAtual')}
                  placeholder="Ex: 3"
                  keyboardType="numeric"
                  maxLength={2}
                  error={alunoErrors.semestreAtual}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Input
                  label="Ano de conclusão *"
                  value={alunoForm.anoConclusao}
                  onChangeText={setAluno('anoConclusao')}
                  placeholder={String(new Date().getFullYear() + 3)}
                  keyboardType="numeric"
                  maxLength={4}
                  error={alunoErrors.anoConclusao}
                />
              </View>
            </View>

            <Divider vertical={Spacing.lg} />
            <Text style={styles.secTitle}>📍 Ponto de Embarque</Text>
            {PONTOS_EMBARQUE.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setAluno('pontoEmbarque')(p)}
                activeOpacity={0.8}
                style={[styles.pontoItem, alunoForm.pontoEmbarque === p && styles.pontoItemActive]}
              >
                <Text style={styles.pontoBullet}>📍</Text>
                <Text style={[styles.pontoTxt, alunoForm.pontoEmbarque === p && styles.pontoTxtActive]}>
                  {p}
                </Text>
                {alunoForm.pontoEmbarque === p && <Text style={styles.pontoCheck}>✔</Text>}
              </TouchableOpacity>
            ))}
            {alunoErrors.pontoEmbarque && (
              <Text style={styles.errorTxt}>{alunoErrors.pontoEmbarque}</Text>
            )}

            <View style={{ height: Spacing.xl }} />
            <Button
              label={loading ? 'Salvando...' : '💾  Salvar Cadastro'}
              onPress={handleSalvarAluno}
              loading={loading}
              fullWidth
              disabled={loading}
            />
          </View>
        )}

        {/* ── Formulário — Motorista ──────────────────────────── */}
        {tipo === 'motorista' && (
          <View style={[styles.card, Shadow.card]}>
            <Text style={styles.secTitle}>🚌 Dados do Motorista</Text>

            <Input
              label="Nome completo *"
              value={motoristaForm.nome}
              onChangeText={setMotorista('nome')}
              placeholder="Nome completo do motorista"
              error={motoristaErrors.nome}
            />
            <Input
              label="CPF *"
              value={motoristaForm.cpf}
              onChangeText={(t) => setMotorista('cpf')(formatarCPF(t))}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              error={motoristaErrors.cpf}
            />
            <Input
              label="Senha inicial *"
              value={motoristaForm.senha}
              onChangeText={setMotorista('senha')}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={motoristaErrors.senha}
              note="O motorista usará esta senha para o primeiro acesso."
            />
            <Input
              label="Telefone"
              value={motoristaForm.telefone}
              onChangeText={(t) => setMotorista('telefone')(formatarTelefone(t))}
              placeholder="(82) 99999-0000"
              keyboardType="phone-pad"
              maxLength={15}
            />

            <View style={{ height: Spacing.xl }} />
            <Button
              label={loading ? 'Salvando...' : '💾  Salvar Cadastro'}
              onPress={handleSalvarMotorista}
              loading={loading}
              fullWidth
              disabled={loading}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingBottom: 40 },

  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  segBtnActive: { backgroundColor: Colors.primary },
  segTxt:       { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segTxtActive: { color: Colors.white },

  successBanner: {
    backgroundColor: Colors.successLight, borderWidth: 1, borderColor: '#a9dfbf',
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  successTxt: { color: Colors.success, fontWeight: '700', fontSize: 14 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl,
  },
  secTitle: { ...Typography.h3, color: Colors.primary, marginBottom: Spacing.md },

  fieldWrap:  { marginBottom: 14 },
  fieldLabel: { ...Typography.label, marginBottom: 6 },
  hScroll:    { flexGrow: 0, marginBottom: 4 },
  errorTxt:   { fontSize: 11, color: Colors.danger, marginTop: 3 },

  chip: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 7, marginRight: 8,
    backgroundColor: Colors.white,
  },
  chipActive:    { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipTxt:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTxtActive: { color: Colors.primary, fontWeight: '700' },

  duoRow: { flexDirection: 'row' },

  pontoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: 8, backgroundColor: Colors.white,
  },
  pontoItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pontoBullet: { fontSize: 16 },
  pontoTxt:    { flex: 1, fontSize: 14, color: Colors.text },
  pontoTxtActive: { color: Colors.primary, fontWeight: '700' },
  pontoCheck:  { fontSize: 16, color: Colors.primary },
});
