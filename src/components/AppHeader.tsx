import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants/theme';

interface AppHeaderProps {
  titulo: string;
  nomeUsuario: string;
  onLogout: () => void;
  exibirLogo?: boolean;
}

const logo = require('../../assets/logo-Maragogi.png');

export const AppHeader: React.FC<AppHeaderProps> = ({
  titulo,
  nomeUsuario,
  onLogout,
  exibirLogo = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>

    {exibirLogo && (
        <View style={styles.logoRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      )}
      {/* Linha inferior: saudação + título + sair */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.saudacao}>Olá, {nomeUsuario}</Text>
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        <TouchableOpacity
          onPress={onLogout}
          style={styles.sairBtn}
          activeOpacity={0.7}>
          <Text style={styles.sairTxt}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logo: {
    height: 46,
    width: 200,
  },
 
  
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saudacao: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  titulo: {
    ...Typography.h3,
    color: Colors.primary,
  },
  sairBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sairTxt: {
    ...Typography.label,
    color: Colors.primary,
  },
});
