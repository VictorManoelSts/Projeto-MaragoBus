import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Radius, Spacing, Typography, Shadow } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { AppHeader } from '../../components/AppHeader';
import { InfoRow } from '../../components/InfoRow';
import { Divider } from '../../components/Divider';
import { getIniciais, dataHoje } from '../../constants/appData';
import { logout } from '../../services/auth.service';
import { useReserva } from '../../contexts/ReservaContext';
import type { AlunoTabParamList, RootStackParamList } from '../../types/Index';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AlunoTabParamList, 'Comprovante'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ComprovanteScreen: React.FC<Props> = ({ route, navigation }) => {
  const { aluno } = route.params;
  const { reserva } = useReserva();

  const handleLogout = async () => {
    await logout();
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.replace('Login');
  };

  const temReserva = reserva !== null;

  return (
    <View style={styles.screen}>
      <AppHeader titulo="Comprovante" nomeUsuario={aluno.nome.split(' ')[0]} onLogout={handleLogout} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {temReserva ? (
          <View style={[styles.card, Shadow.card]}>
            {/* Cabeçalho azul */}
            <View style={styles.cardHead}>
              <Avatar
                iniciais={getIniciais(aluno.nome)}
                uri={aluno.foto}
                size={60}
                backgroundColor={Colors.primaryDark}
              />
              <View style={styles.headInfo}>
                <Text style={styles.alunoNome}>{aluno.nome}</Text>
                <Text style={styles.alunoSub}>{aluno.curso} — {aluno.faculdade}</Text>
                <View style={{ marginTop: 6 }}>
                  <Badge label="✓ Reserva Confirmada" color={Colors.success} />
                </View>
              </View>
            </View>

            {/* Dados */}
            <View style={styles.dados}>
              <InfoRow label="📅 Data"                value={reserva.data ?? dataHoje()} />
              <InfoRow label="🕐 Hora da reserva"     value={reserva.hora} />
              <InfoRow label="🏫 Faculdade"           value={aluno.faculdade} />
              <InfoRow label="📚 Curso"               value={aluno.curso} />
              <InfoRow label="🎓 Modalidade"          value={aluno.modalidade} />
              <InfoRow label="📍 Ponto de embarque"   value={aluno.pontoEmbarque} />
              <InfoRow label="📱 Telefone"            value={aluno.telefone} />
              <InfoRow label="📋 Semestre"            value={`${aluno.semestreAtual}º semestre`} />
            </View>

            <Divider vertical={Spacing.lg} />

            {/* QR Code simulado */}
            <View style={styles.qrWrap}>
              <Text style={styles.qrLabel}>COMPROVANTE DE RESERVA</Text>
              <View style={styles.qrBox}>
                <QRSimulado />
              </View>
              <Text style={styles.qrSub}>Apresente ao embarcar em Japaratinga</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyTitle}>Nenhuma reserva ativa</Text>
            <Text style={styles.emptySub}>
              Faça sua reserva na aba "Reserva" para gerar o comprovante.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

/** Representação visual de QR Code (substituir por react-native-qrcode-svg em produção) */
const QRSimulado: React.FC = () => {
  const CELL = 8;

  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    [1,1,0,1,0,1,1,0,1,0,1,1,0,1,0],
    [0,1,0,0,1,0,0,0,0,1,0,1,1,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,0,0,1,0],
    [0,1,0,1,0,0,0,0,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,0,0,1,1,1,0,0,0],
    [0,1,0,0,1,0,0,0,1,0,0,1,0,1,0],
    [1,0,1,0,0,1,1,0,1,0,1,0,1,0,1],
  ];

  return (
    <View style={{ flexDirection: 'column', gap: 1 }}>
      {pattern.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 1 }}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: CELL, height: CELL,
                backgroundColor: cell ? Colors.primary : Colors.white,
                borderRadius: 1,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },

  cardHead: {
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headInfo: { flex: 1 },
  alunoNome: { fontSize: 17, fontWeight: '800', color: Colors.white },
  alunoSub:  { fontSize: 13, color: '#c8e6f5', marginTop: 2 },

  dados: { padding: Spacing.lg },

  qrWrap: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  qrBox: {
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
  },
  qrSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon:  { fontSize: 52, marginBottom: 12 },
  emptyTitle: { ...Typography.h3, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
