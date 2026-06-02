import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
 
type Variant = 'primary' | 'outline' | 'danger' | 'ghost' | 'success';
 
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  small?: boolean;
}
 
export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', loading = false,
  disabled = false, style, fullWidth = false, small = false,
}) => {
  const isDisabled = disabled || loading;
 
  const variantStyles: Record<Variant, { bg: string; textColor: string; border?: string }> = {
    primary: { bg: Colors.primary,      textColor: '#fff' },
    success: { bg: Colors.success,      textColor: '#fff' },
    danger:  { bg: Colors.danger,       textColor: '#fff' },
    outline: { bg: 'transparent',       textColor: Colors.primary, border: Colors.primary },
    ghost:   { bg: 'transparent',       textColor: Colors.textSecondary, border: Colors.border },
  };
 
  const v = variantStyles[variant];
 
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1.5 : 0,
          opacity: isDisabled ? 0.5 : 1,
          paddingVertical: small ? 9 : 14,
          borderRadius: small ? Radius.sm : Radius.md,
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={v.textColor} size="small" />
        : <Text style={[styles.label, { color: v.textColor, fontSize: small ? 13 : 15 }]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  label: {
    fontWeight: '700',
  },
});
