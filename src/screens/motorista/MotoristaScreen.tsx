import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { AppHeader } from '../../components/AppHeader';
import { Avatar } from '../../components/Avatar';
import { Divider } from '../../components/Divider';
import { InfoRow } from '../../components/InfoRow';
import { Button } from '../../components/Button';
import { getIniciais } from '../../constants/appData';
import { logout } from '../../services/auth.service';
import { getReservasPorData, dataAtual } from '../../services/reservas.service';
import { getAlunosByIds } from '../../services/alunos.service';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackParamList, Aluno, Reserva } from '../../types/Index';

type Props = NativeStackScreenProps<RootStackParamList, 'MotoristaRoot'>;
type Visao = 'faculdade' | 'ponto';

interface ReservaComAluno extends Reserva {
  aluno?: Aluno;
}

export const MotoristaScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [visao, setVisao]       = useState<Visao>('faculdade');
  const [detalhe, setDetalhe]   = useState<ReservaComAluno | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [reservas, setReservas] = useState<ReservaComAluno[]>([]);

  const nomeMotorista = user?.displayName ?? 'Motorista';

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await getReservasPorData(dataAtual());
      if (lista.length === 0) { setReservas([]); return; }

      const alunoIds = lista.map((r) => r.alunoId);
      const alunos   = await getAlunosByIds(alunoIds);
      const mapaAlunos = Object.fromEntries(alunos.map((a) => [a.id, a]));

      // Exclui alunos suspensos
      const ativas = lista
        .map((r) => ({ ...r, aluno: mapaAlunos[r.alunoId] }))
        .filter((r) => r.aluno?.status === 'ativo');

      setReservas(ativas);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os passageiros.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  /* ── Agrupar por faculdade ───────────────────────────────────────── */
  const porFaculdade = useMemo(() => {
    return reservas.reduce<Record<string, ReservaComAluno[]>>((acc, r) => {
      const fac = r.aluno?.faculdade ?? r.faculdade ?? 'Desconhecida';
      acc[fac]  = [...(acc[fac] ?? []), r];
      return acc;
    }, {});
  }, [reservas]);

  /* ── Agrupar por ponto ───────────────────────────────────────────── */
  const porPonto = useMemo(() => {
    return reservas.reduce<Record<string, ReservaComAluno[]>>((acc, r) => {
      const ponto = r.aluno?.pontoEmbarque ?? r.pontoEmbarque ?? 'Desconhecido';
      acc[ponto]  = [...(acc[ponto] ?? []), r];
      return acc;
    }, {});
  }, [reservas]);

  return (
    <View style={styles.screen}>
      <AppHeader titulo="Passageiros" nomeUsuario={nomeMotorista} onLogout={handleLogout} exibirLogo={true} />

      {/* ── Card total ─────────────────────────────── */}
      <View style={styles.totalCard}>
        <Text style={styles.totalIcon}>🚌</Text>
        <View>
          <Text style={styles.totalSub}>Reservas confirmadas hoje</Text>
          <Text style={styles.totalNum}>{reservas.length} alunos</Text>
        </View>
      </View>

      {/* ── Seletor de visão ───────────────────────── */}
      <View style={styles.toggleRow}>
        {([['faculdade', 'Por Faculdade'], ['ponto', 'Por Ponto']] as [Visao, string][]).map(
          ([id, label]) => (
            <TouchableOpacity
              key={id}
              onPress={() => setVisao(id)}
              activeOpacity={0.8}
              style={[styles.toggleBtn, visao === id && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleTxt, visao === id && styles.toggleTxtActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {carregando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Por faculdade ──────────────────────── */}
          {visao === 'faculdade' &&
            Object.entries(porFaculdade).map(([fac, lista]) => (
              <View key={fac} style={[styles.grupoCard, Shadow.card]}>
                <View style={styles.grupoHead}>
                  <Text style={styles.grupoNome}>{fac}</Text>
                  <View style={styles.grupoContBadge}>
                    <Text style={styles.grupoContTxt}>{lista.length} alunos</Text>
                  </View>
                </View>

                {lista.map((r, i) => {
                  const nome  = r.aluno?.nome         ?? r.nomeAluno      ?? '—';
                  const ponto = r.aluno?.pontoEmbarque ?? r.pontoEmbarque  ?? '—';
                  const foto  = r.aluno?.foto          ?? r.foto           ?? null;

                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setDetalhe(r)}
                      activeOpacity={0.8}
                      style={[styles.alunoRow, i < lista.length - 1 && styles.alunoRowBorder]}
                    >
                      <Avatar iniciais={getIniciais(nome)} uri={foto} size={38} />
                      <View style={styles.alunoInfo}>
                        <Text style={styles.alunoNome}>{nome}</Text>
                        <Text style={styles.alunoPonto}>📍 {ponto}</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

          {/* ── Por ponto ─────────────────────────── */}
          {visao === 'ponto' &&
            Object.entries(porPonto).map(([ponto, lista]) => (
              <View key={ponto} style={[styles.grupoCard, Shadow.card]}>
                <View style={[styles.grupoHead, styles.grupoHeadPonto]}>
                  <Text style={[styles.grupoNome, { color: Colors.primary }]}>📍 {ponto}</Text>
                  <View style={[styles.grupoContBadge, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.grupoContTxt}>{lista.length} alunos</Text>
                  </View>
                </View>

                {lista.map((r, i) => {
                  const nome     = r.aluno?.nome         ?? r.nomeAluno  ?? '—';
                  const faculdade = r.aluno?.faculdade    ?? r.faculdade  ?? '—';
                  const curso    = r.aluno?.curso         ?? r.curso      ?? '—';
                  const telefone = r.aluno?.telefone      ?? r.telefone   ?? '—';
                  const foto     = r.aluno?.foto          ?? r.foto       ?? null;

                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setDetalhe(r)}
                      activeOpacity={0.8}
                      style={[styles.alunoRow, i < lista.length - 1 && styles.alunoRowBorder]}
                    >
                      <Avatar iniciais={getIniciais(nome)} uri={foto} size={36} />
                      <View style={styles.alunoInfo}>
                        <Text style={styles.alunoNome}>{nome}</Text>
                        <Text style={styles.alunoPonto}>{faculdade} — {curso}</Text>
                      </View>
                      <Text style={styles.telefoneTxt}>{telefone}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

          {reservas.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTxt}>Nenhuma reserva para hoje.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Modal detalhe ────────────────────────── */}
      <Modal visible={!!detalhe} animationType="slide" transparent onRequestClose={() => setDetalhe(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setDetalhe(null)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              {detalhe && (() => {
                const a = detalhe.aluno;
                const nome       = a?.nome          ?? detalhe.nomeAluno    ?? '—';
                const faculdade  = a?.faculdade      ?? detalhe.faculdade    ?? '—';
                const curso      = a?.curso          ?? detalhe.curso        ?? '—';
                const ponto      = a?.pontoEmbarque  ?? detalhe.pontoEmbarque ?? '—';
                const telefone   = a?.telefone       ?? detalhe.telefone     ?? '—';
                const modalidade = a?.modalidade     ?? detalhe.modalidade   ?? '—';
                const semestre   = a?.semestreAtual  ?? detalhe.semestreAtual ?? 0;
                const foto       = a?.foto           ?? detalhe.foto         ?? null;

                return (
                  <>
                    <View style={styles.sheetHead}>
                      <Avatar iniciais={getIniciais(nome)} uri={foto} size={54} />
                      <View style={styles.sheetHeadInfo}>
                        <Text style={styles.sheetNome}>{nome}</Text>
                      </View>
                    </View>
                    <Divider />
                    <InfoRow label="🏫 Faculdade"         value={faculdade} />
                    <InfoRow label="📚 Curso"             value={curso} />
                    <InfoRow label="📍 Ponto de embarque" value={ponto} />
                    <InfoRow label="📱 Telefone"          value={telefone} />
                    <InfoRow label="🎓 Modalidade"        value={modalidade} />
                    <InfoRow label="📅 Semestre"          value={`${semestre}º`} />
                    <Divider vertical={Spacing.lg} />
                    <Button label="Fechar" onPress={() => setDetalhe(null)} variant="ghost" fullWidth />
                  </>
                );
              })()}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  totalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary, margin: Spacing.lg,
    borderRadius: Radius.lg, padding: Spacing.lg,
  },
  totalIcon: { fontSize: 30 },
  totalSub:  { color: '#c8e6f5', fontSize: 12 },
  totalNum:  { color: Colors.white, fontSize: 24, fontWeight: '800' },

  toggleRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white,
  },
  toggleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  toggleTxt:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  toggleTxtActive: { color: Colors.primary },

  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  grupoCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    marginBottom: Spacing.md, overflow: 'hidden',
  },
  grupoHead: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  grupoHeadPonto: { backgroundColor: Colors.primaryLight },
  grupoNome:      { fontSize: 15, fontWeight: '700', color: Colors.white },
  grupoContBadge: {
    backgroundColor: 'rgba(255,255,255,.25)', borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 3,
  },
  grupoContTxt: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  alunoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  alunoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  alunoInfo:  { flex: 1 },
  alunoNome:  { fontSize: 14, fontWeight: '600', color: Colors.text },
  alunoPonto: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  chevron:    { fontSize: 20, color: Colors.primary },
  telefoneTxt:{ fontSize: 11, color: Colors.primary, fontWeight: '600' },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 22,
    borderTopRightRadius: 22, padding: Spacing.xl,
    ...Shadow.modal,
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.md },
  sheetHeadInfo: { flex: 1 },
  sheetNome: { ...Typography.h3 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxt:  { fontSize: 15, color: Colors.textSecondary },
});
