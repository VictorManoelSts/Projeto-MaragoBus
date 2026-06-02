import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { getIniciais } from '../../constants/appData';
import { getReservasPorData, dataAtual, dataAmanha } from '../../services/reservas.service';
import { getAlunosByIds } from '../../services/alunos.service';
import type { Aluno, Reserva } from '../../types/Index';

type Aba = 'hoje' | 'amanha';

interface ReservaComAluno extends Reserva {
  aluno?: Aluno;
}

export const ReservasScreen: React.FC = () => {
  const [aba, setAba]           = useState<Aba>('hoje');
  const [carregando, setCarregando] = useState(true);
  const [reservasHoje, setReservasHoje]   = useState<ReservaComAluno[]>([]);
  const [reservasAmanha, setReservasAmanha] = useState<ReservaComAluno[]>([]);

  const agora = new Date();
  const hora  = agora.getHours();
  const dia   = agora.getDay(); // 0=Dom, 6=Sáb
  const amanhaDisponivel = hora >= 17 || dia === 0 || dia === 6 || (dia === 5 && hora >= 17);

  const carregarReservas = useCallback(async (data: string): Promise<ReservaComAluno[]> => {
    const reservas = await getReservasPorData(data);
    if (reservas.length === 0) return [];

    const alunoIds = reservas.map((r) => r.alunoId);
    const alunos   = await getAlunosByIds(alunoIds);
    const mapaAlunos = Object.fromEntries(alunos.map((a) => [a.id, a]));

    return reservas.map((r) => ({ ...r, aluno: mapaAlunos[r.alunoId] }));
  }, []);

  useEffect(() => {
    setCarregando(true);
    const promises = [carregarReservas(dataAtual())];
    if (amanhaDisponivel) promises.push(carregarReservas(dataAmanha()));

    Promise.all(promises)
      .then(([hoje, amanha]) => {
        setReservasHoje(hoje);
        if (amanha) setReservasAmanha(amanha);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar as reservas.'))
      .finally(() => setCarregando(false));
  }, [carregarReservas, amanhaDisponivel]);

  const reservasAtivas = aba === 'hoje' ? reservasHoje : reservasAmanha;

  // Label dinâmico para a segunda aba: "Segunda" no fim de semana / sexta ≥17h
  const labelAmanha = (dia === 0 || dia === 6 || (dia === 5 && hora >= 17))
    ? '🔮 Segunda'
    : '🔮 Amanhã';

  // Agrupa por faculdade usando dados denormalizados da reserva (ou do aluno, se disponível)
  const porFaculdade = useMemo(() => {
    return reservasAtivas.reduce<Record<string, ReservaComAluno[]>>((acc, r) => {
      const fac = r.aluno?.faculdade ?? r.faculdade ?? 'Sem faculdade';
      acc[fac] = [...(acc[fac] ?? []), r];
      return acc;
    }, {});
  }, [reservasAtivas]);

  if (carregando) {
    return (
      <View style={[styles.scroll, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Resumo ─────────────────────────────────── */}
      <View style={styles.resumoRow}>
        {[
          { icon: '✅', val: reservasHoje.length,   label: 'Hoje',                                      cor: Colors.success },
          { icon: '🔮', val: reservasAmanha.length,  label: labelAmanha.replace('🔮 ', ''), cor: Colors.primary },
          { icon: '📊', val: reservasHoje.length + reservasAmanha.length, label: 'Total',  cor: Colors.text },
        ].map((item) => (
          <View key={item.label} style={[styles.resumoCard, Shadow.card]}>
            <Text style={styles.resumoIcon}>{item.icon}</Text>
            <Text style={[styles.resumoNum, { color: item.cor }]}>{item.val}</Text>
            <Text style={styles.resumoLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Tabs ────────────────────────────────────── */}
      <View style={styles.tabRow}>
        {([['hoje', '📅 Hoje'], ['amanha', labelAmanha]] as [Aba, string][]).map(
          ([id, label]) => (
            <TouchableOpacity
              key={id}
              onPress={() => {
                if (id === 'amanha' && !amanhaDisponivel) return;
                setAba(id);
              }}
              activeOpacity={0.8}
              style={[styles.tabBtn, aba === id && styles.tabBtnActive]}
            >
              <Text style={[styles.tabTxt, aba === id && styles.tabTxtActive]}>{label}</Text>
              {id === 'amanha' && !amanhaDisponivel && (
                <Text style={styles.tabLock}> 🔒 17h</Text>
              )}
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* ── Grupos por faculdade ─────────────────── */}
      {Object.entries(porFaculdade).map(([fac, lista]) => (
        <View key={fac} style={[styles.grupoCard, Shadow.card]}>
          <View style={styles.grupoHead}>
            <Text style={styles.grupoNome}>{fac}</Text>
            <View style={styles.grupoCount}>
              <Text style={styles.grupoCountTxt}>{lista.length} alunos</Text>
            </View>
          </View>

          {lista.map((r, i) => {
            const nome      = r.aluno?.nome       ?? r.nomeAluno      ?? '—';
            const ponto     = r.aluno?.pontoEmbarque ?? r.pontoEmbarque ?? '—';
            const modalidade = r.aluno?.modalidade  ?? r.modalidade    ?? '—';
            const foto      = r.aluno?.foto        ?? r.foto           ?? null;

            return (
              <View
                key={r.id}
                style={[styles.alunoRow, i < lista.length - 1 && styles.alunoRowBorder]}
              >
                <Avatar iniciais={getIniciais(nome)} uri={foto} size={36}
                  backgroundColor={Colors.primary} />
                <View style={styles.alunoInfo}>
                  <Text style={styles.alunoNome}>{nome}</Text>
                  <Text style={styles.alunoPonto}>📍 {ponto}</Text>
                </View>
                <Badge label={modalidade} color={Colors.primary} />
              </View>
            );
          })}
        </View>
      ))}

      {reservasAtivas.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTxt}>Nenhuma reserva encontrada.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingBottom: 40 },

  resumoRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  resumoCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center',
  },
  resumoIcon:  { fontSize: 20, marginBottom: 2 },
  resumoNum:   { fontSize: 22, fontWeight: '800' },
  resumoLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },

  tabRow: {
    flexDirection: 'row', backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md, padding: 3, marginBottom: Spacing.lg, gap: 3,
  },
  tabBtn: {
    flex: 1, paddingVertical: 9, borderRadius: Radius.sm,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabTxt:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTxtActive: { color: Colors.white },
  tabLock:      { fontSize: 11, color: Colors.textSecondary },

  grupoCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    marginBottom: Spacing.md, overflow: 'hidden',
  },
  grupoHead: {
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.primaryMid,
  },
  grupoNome:     { fontSize: 14, fontWeight: '700', color: Colors.primary },
  grupoCount:    { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 2 },
  grupoCountTxt: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  alunoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  alunoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  alunoInfo:  { flex: 1 },
  alunoNome:  { fontSize: 14, fontWeight: '600', color: Colors.text },
  alunoPonto: { fontSize: 12, color: Colors.textSecondary },

  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxt:  { fontSize: 15, color: Colors.textSecondary },
});
