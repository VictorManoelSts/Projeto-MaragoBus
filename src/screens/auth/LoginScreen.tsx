import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { formatarCPF } from '../../constants/appData';
import { login } from '../../services/auth.service';
import { getAluno } from '../../services/alunos.service';
import { getAdmin } from '../../services/admins.service';
import type { RootStackParamList, UserRole } from '../../types/Index';

const logo = require('../../../assets/logo-Maragogi.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [cpf, setCpf]       = useState('');
  const [senha, setSenha]   = useState('');
  const [perfil, setPerfil] = useState<UserRole>('aluno');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length < 11) { Alert.alert('Atenção', 'CPF inválido.'); return; }
    if (senha.length < 4)   { Alert.alert('Atenção', 'Senha muito curta.'); return; }

    setLoading(true);
    try {
      const { uid, papel } = await login(cpf, senha);

      if (papel !== perfil) {
        throw Object.assign(new Error(), { code: 'auth/invalid-credential' });
      }

      if (papel === 'aluno') {
        const aluno = await getAluno(uid);
        if (!aluno) throw new Error('Dados do aluno não encontrados.');
        navigation.replace('AlunoTabs', { aluno });
      } else if (papel === 'motorista') {
        navigation.replace('MotoristaRoot');
      } else {
        const admin = await getAdmin(uid);
        if (!admin) throw new Error('Dados do administrador não encontrados.');
        navigation.replace('AdminTabs', { admin });
      }
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'CPF ou senha incorretos.'
          : err.code === 'auth/user-not-found'
          ? 'Usuário não encontrado.'
          : err.code === 'auth/too-many-requests'
          ? 'Muitas tentativas. Tente novamente mais tarde.'
          : err.message ?? 'Erro ao entrar. Verifique sua conexão.';
      Alert.alert('Erro no login', msg);
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: UserRole; label: string }[] = [
    { id: 'aluno',     label: 'Aluno' },
    { id: 'motorista', label: 'Motorista' },
    { id: 'admin',     label: 'Admin' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo ─────────────────────────────────────── */}
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>MaragoBus</Text>
          <Text style={styles.appSub}>Transporte Universitário</Text>
        </View>

        {/* ── Card ─────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar</Text>

          {/* Seletor de perfil */}
          <View style={styles.perfilRow}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setPerfil(r.id)}
                activeOpacity={0.75}
                style={[
                  styles.perfilBtn,
                  perfil === r.id && styles.perfilBtnActive,
                ]}
              >
                <Text style={[
                  styles.perfilTxt,
                  perfil === r.id && styles.perfilTxtActive,
                ]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="CPF"
            value={cpf}
            onChangeText={(t) => setCpf(formatarCPF(t))}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
          />

          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            label={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            loading={loading}
            fullWidth
          />

          <Text style={styles.esqueciTxt}>
            Esqueceu a senha? Fale com a secretaria.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    height: 80,
    width: 220,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 380,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
  },
  perfilRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.lg,
    gap: 3,
  },
  perfilBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  perfilBtnActive: {
    backgroundColor: Colors.primary,
  },
  perfilTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  perfilTxtActive: {
    color: Colors.white,
  },
  esqueciTxt: {
    textAlign: 'center',
    marginTop: Spacing.md,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
