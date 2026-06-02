import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { Button } from '../../components/Button';
import { AppHeader } from '../../components/AppHeader';
import { getReservaAtiva, criarReserva, cancelarReserva } from '../../services/reservas.service';
import { logout } from '../../services/auth.service';
import { useReserva } from '../../contexts/ReservaContext';
import type { AlunoTabParamList, RootStackParamList } from '../../types/Index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AlunoTabParamList, 'Reserva'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ReservaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { aluno } = route.params;
  const { reserva, setReserva } = useReserva();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando]     = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [horaAtual, setHoraAtual]   = useState(new Date());

  // Atualiza o relógio a cada minuto
  useEffect(() => {
    const t = setInterval(() => setHoraAtual(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Carrega reserva ativa do Firestore ao montar
  useEffect(() => {
    let ativo = true;
    getReservaAtiva(aluno.id)
      .then((r) => { if (ativo) setReserva(r); })
      .catch(() => {})
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [aluno.id]);

  const hora           = horaAtual.getHours();
  const dia            = horaAtual.getDay(); // 0=Dom, 6=Sáb
  const ehFimDeSemana  = dia === 0 || dia === 6;
  const dentroJanela   = ehFimDeSemana || hora >= 17 || hora < 11;
  const podeCancelar   = ehFimDeSemana || hora < 16;

  const handleConfirmar = () => {
    if (aluno.status === 'suspenso') {
      Alert.alert('Acesso suspenso', 'Sua inscrição está suspensa. Fale com o administrador.');
      return;
    }
    if (!dentroJanela) {
      Alert.alert('Fora do horário', 'Reservas disponíveis das 17h até 11h do dia seguinte.');
      return;
    }
    Alert.alert(
      'Confirmar vaga?',
      `Ponto de embarque: ${aluno.pontoEmbarque}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSalvando(true);
            try {
              const nova = await criarReserva(aluno);
              setReserva(nova);
            } catch {
              Alert.alert('Erro', 'Não foi possível confirmar a reserva. Tente novamente.');
            } finally {
              setSalvando(false);
            }
          },
        },
      ],
    );
  };

  const handleCancelar = () => {
    if (!podeCancelar) {
      Alert.alert('Prazo encerrado', 'Cancelamentos disponíveis até as 16h.');
      return;
    }
    setCancelando(true);
  };

  const confirmarCancelamento = async () => {
    setSalvando(true);
    try {
      await cancelarReserva(aluno.id);
      setReserva(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar a reserva. Tente novamente.');
    } finally {
      setSalvando(false);
      setCancelando(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.replace('Login');
  };

  if (carregando) {
    return (
      <View style={styles.screen}>
        <AppHeader titulo="Reserva de Vaga" nomeUsuario={aluno.nome.split(' ')[0]} onLogout={handleLogout} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader titulo="Reserva de Vaga" nomeUsuario={aluno.nome.split(' ')[0]} onLogout={handleLogout} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Banner de horário ──────────────────────── */}
        <View style={[styles.banner, !dentroJanela && styles.bannerClosed]}>
          <Text style={styles.bannerIcon}>{dentroJanela ? '🟢' : '🔴'}</Text>
          <View>
            <Text style={styles.bannerTitle}>
              {dentroJanela ? 'Inscrições abertas' : 'Inscrições encerradas'}
            </Text>
            <Text style={styles.bannerSub}>
              Disponíveis das 17h até 11h do dia seguinte
            </Text>
          </View>
        </View>

        {/* ── Card do aluno ──────────────────────────── */}
        <View style={[styles.card, Shadow.card]}>
          <Text style={styles.cardLabel}>Seus dados</Text>
          {[
            ['Faculdade', aluno.faculdade],
            ['Curso',     aluno.curso],
            ['Semestre',  `${aluno.semestreAtual}º`],
          ].map(([k, v]) => (
            <View key={k} style={styles.dataRow}>
              <Text style={styles.dataKey}>{k}</Text>
              <Text style={styles.dataVal}>{v}</Text>
            </View>
          ))}

          {/* Ponto de embarque */}
          <View style={styles.pontoCard}>
            <Text style={styles.pontoIcon}>📍</Text>
            <View>
              <Text style={styles.pontoLabel}>Ponto de embarque</Text>
              <Text style={styles.pontoVal}>{aluno.pontoEmbarque}</Text>
            </View>
          </View>
        </View>

        {/* ── Status / ações ────────────────────────── */}
        {!reserva ? (
          <TouchableOpacity
            onPress={handleConfirmar}
            activeOpacity={0.8}
            disabled={salvando}
            style={[styles.confirmBtn, !dentroJanela && styles.confirmBtnDisabled]}
          >
            {salvando
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.confirmIcon}>✔</Text>
                  <Text style={styles.confirmTxt}>Confirmar Vaga</Text>
                </>
            }
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Vaga Confirmada!</Text>
              <Text style={styles.successSub}>Sua reserva para {reserva.data === new Date().toISOString().split('T')[0] ? 'hoje' : 'amanhã'} está garantida.</Text>
            </View>

            {!cancelando ? (
              podeCancelar && (
                <Button
                  label="❌  Cancelar Reserva"
                  onPress={handleCancelar}
                  variant="outline"
                  fullWidth
                  style={{ marginTop: Spacing.md }}
                />
              )
            ) : (
              <View style={styles.cancelCard}>
                <Text style={styles.cancelTitle}>Confirmar cancelamento?</Text>
                <Text style={styles.cancelSub}>
                  Você perderá sua vaga. Disponível até as 16h.
                </Text>
                <View style={styles.cancelRow}>
                  <Button
                    label="Voltar"
                    onPress={() => setCancelando(false)}
                    variant="ghost"
                    style={{ flex: 1 }}
                    disabled={salvando}
                  />
                  <View style={{ width: 10 }} />
                  <Button
                    label={salvando ? 'Cancelando...' : 'Cancelar'}
                    onPress={confirmarCancelamento}
                    variant="danger"
                    style={{ flex: 1 }}
                    loading={salvando}
                  />
                </View>
              </View>
            )}
          </>
        )}

        {/* Advertências */}
        {aluno.advertencias > 0 && (
          <View style={styles.warnCard}>
            <Text style={styles.warnIcon}>⚠️</Text>
            <Text style={styles.warnTxt}>
              Você possui {aluno.advertencias} advertência{aluno.advertencias > 1 ? 's' : ''}.
              {aluno.advertencias >= 2 ? ' Mais uma e sua inscrição será suspensa.' : ''}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primaryMid,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg,
  },
  bannerClosed: {
    backgroundColor: '#fff8e1', borderColor: '#ffe082',
  },
  bannerIcon: { fontSize: 22 },
  bannerTitle: { ...Typography.h3, fontSize: 14 },
  bannerSub:   { ...Typography.small, marginTop: 1 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  cardLabel: { ...Typography.label, marginBottom: Spacing.sm },
  dataRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dataKey: { fontSize: 13, color: Colors.textSecondary },
  dataVal: { fontSize: 13, fontWeight: '700', color: Colors.text },

  pontoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  pontoIcon:  { fontSize: 20 },
  pontoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  pontoVal:   { fontSize: 15, fontWeight: '800', color: Colors.primary },

  confirmBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 20, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
    marginBottom: Spacing.md,
  },
  confirmBtnDisabled: { backgroundColor: Colors.primaryMid },
  confirmIcon: { fontSize: 20, color: '#fff' },
  confirmTxt:  { fontSize: 18, fontWeight: '800', color: '#fff' },

  successCard: {
    backgroundColor: Colors.successLight, borderWidth: 1.5,
    borderColor: '#a9dfbf', borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md,
  },
  successIcon:  { fontSize: 40, marginBottom: 6 },
  successTitle: { fontSize: 18, fontWeight: '800', color: Colors.success },
  successSub:   { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  cancelCard: {
    backgroundColor: Colors.dangerLight, borderWidth: 1.5,
    borderColor: '#f1948a', borderRadius: Radius.lg,
    padding: Spacing.lg, marginTop: Spacing.sm,
  },
  cancelTitle: { ...Typography.h3, marginBottom: 4 },
  cancelSub:   { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.md },
  cancelRow:   { flexDirection: 'row' },

  warnCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fff8e1', borderRadius: Radius.md,
    borderWidth: 1, borderColor: '#ffe082',
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  warnIcon: { fontSize: 18 },
  warnTxt:  { flex: 1, fontSize: 13, color: Colors.text },
});
