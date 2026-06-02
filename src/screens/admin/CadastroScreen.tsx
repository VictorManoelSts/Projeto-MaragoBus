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
import type { Modalidade } from '../../types/Index';

interface FormState {
  nome: string;
  cpf: string;
  senha: string;
  telefone: string;
  endereco: string;
  faculdade: string;
  curso: string;
  modalidade: Modalidade | '';
  semestreAtual: string;
  anoConclusao: string;
  pontoEmbarque: string;
}

const EMPTY: FormState = {
  nome: '', cpf: '', senha: '', telefone: '', endereco: '',
  faculdade: '', curso: '', modalidade: '',
  semestreAtual: '', anoConclusao: '', pontoEmbarque: '',
};

export const CadastroScreen: React.FC = () => {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const set = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validar = (): boolean => {
    const errs: typeof errors = {};
    if (!form.nome.trim())                          errs.nome          = 'Nome obrigatório';
    if (form.cpf.replace(/\D/g,'').length < 11)    errs.cpf           = 'CPF inválido';
    if (form.senha.length < 6)                      errs.senha         = 'Senha deve ter pelo menos 6 caracteres';
    if (!form.faculdade)                            errs.faculdade     = 'Selecione a faculdade';
    if (!form.curso)                                errs.curso         = 'Selecione o curso';
    if (!form.modalidade)                           errs.modalidade    = 'Selecione a modalidade';
    if (!form.pontoEmbarque)                        errs.pontoEmbarque = 'Selecione o ponto';
    const sem = Number(form.semestreAtual);
    if (!sem || sem < 1 || sem > 12)                errs.semestreAtual = 'Semestre inválido (1–12)';
    const ano = Number(form.anoConclusao);
    if (!ano || ano < 2024)                         errs.anoConclusao  = 'Ano de conclusão inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await criarAluno({
        nome:          form.nome.trim(),
        cpf:           form.cpf,
        senha:         form.senha,
        telefone:      form.telefone.trim(),
        endereco:      form.endereco.trim(),
        faculdade:     form.faculdade,
        curso:         form.curso,
        modalidade:    form.modalidade as Modalidade,
        semestreAtual: Number(form.semestreAtual),
        anoConclusao:  Number(form.anoConclusao),
        pontoEmbarque: form.pontoEmbarque,
      });
      setSucesso(true);
      setForm(EMPTY);
      setErrors({});
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
        {sucesso && (
          <View style={styles.successBanner}>
            <Text style={styles.successTxt}>✅ Aluno cadastrado com sucesso!</Text>
          </View>
        )}

        <View style={[styles.card, Shadow.card]}>
          {/* ── Dados pessoais ──────────────────────── */}
          <Text style={styles.secTitle}>👤 Dados Pessoais</Text>

          <Input
            label="Nome completo *"
            value={form.nome}
            onChangeText={set('nome')}
            placeholder="Nome completo do aluno"
            error={errors.nome}
          />
          <Input
            label="CPF *"
            value={form.cpf}
            onChangeText={(t) => set('cpf')(formatarCPF(t))}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
            error={errors.cpf}
          />
          <Input
            label="Senha inicial *"
            value={form.senha}
            onChangeText={set('senha')}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.senha}
            note="O aluno usará esta senha para o primeiro acesso."
          />
          <Input
            label="Telefone"
            value={form.telefone}
            onChangeText={(t) => set('telefone')(formatarTelefone(t))}
            placeholder="(82) 99999-0000"
            keyboardType="phone-pad"
            maxLength={15}
          />
          <Input
            label="Endereço"
            value={form.endereco}
            onChangeText={set('endereco')}
            placeholder="Rua, número, bairro"
          />

          <Divider vertical={Spacing.lg} />

          {/* ── Dados acadêmicos ────────────────────── */}
          <Text style={styles.secTitle}>🏫 Dados Acadêmicos</Text>

          {/* Faculdade */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Faculdade *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {FACULDADES.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => set('faculdade')(f)}
                  style={[styles.chip, form.faculdade === f && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, form.faculdade === f && styles.chipTxtActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.faculdade && <Text style={styles.errorTxt}>{errors.faculdade}</Text>}
          </View>

          {/* Curso */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Curso *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {CURSOS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => set('curso')(c)}
                  style={[styles.chip, form.curso === c && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, form.curso === c && styles.chipTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.curso && <Text style={styles.errorTxt}>{errors.curso}</Text>}
          </View>

          {/* Modalidade */}
          <SelectInput
            label="Modalidade de ensino *"
            value={form.modalidade}
            options={[...MODALIDADES]}
            onChange={(v) => set('modalidade')(v as Modalidade)}
          />
          {errors.modalidade && <Text style={[styles.errorTxt, { marginTop: -10, marginBottom: 10 }]}>{errors.modalidade}</Text>}

          <View style={styles.duoRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Semestre atual *"
                value={form.semestreAtual}
                onChangeText={set('semestreAtual')}
                placeholder="Ex: 3"
                keyboardType="numeric"
                maxLength={2}
                error={errors.semestreAtual}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Input
                label="Ano de conclusão *"
                value={form.anoConclusao}
                onChangeText={set('anoConclusao')}
                placeholder={String(new Date().getFullYear() + 3)}
                keyboardType="numeric"
                maxLength={4}
                error={errors.anoConclusao}
              />
            </View>
          </View>

          <Divider vertical={Spacing.lg} />

          {/* ── Ponto de embarque ───────────────────── */}
          <Text style={styles.secTitle}>📍 Ponto de Embarque</Text>
          {PONTOS_EMBARQUE.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => set('pontoEmbarque')(p)}
              activeOpacity={0.8}
              style={[styles.pontoItem, form.pontoEmbarque === p && styles.pontoItemActive]}
            >
              <Text style={styles.pontoBullet}>📍</Text>
              <Text style={[styles.pontoTxt, form.pontoEmbarque === p && styles.pontoTxtActive]}>
                {p}
              </Text>
              {form.pontoEmbarque === p && <Text style={styles.pontoCheck}>✔</Text>}
            </TouchableOpacity>
          ))}
          {errors.pontoEmbarque && <Text style={styles.errorTxt}>{errors.pontoEmbarque}</Text>}

          <View style={{ height: Spacing.xl }} />

          <Button
            label={loading ? 'Salvando...' : '💾  Salvar Cadastro'}
            onPress={handleSalvar}
            loading={loading}
            fullWidth
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingBottom: 40 },

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
