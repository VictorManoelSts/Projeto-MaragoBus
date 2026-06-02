import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TextInputProps,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
 
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  note?: string;
}
 
export const Input: React.FC<InputProps> = ({ label, error, note, style, ...rest }) => (
  <View style={styles.wrapper}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      placeholderTextColor={Colors.textSecondary}
      style={[
        styles.input,
        error ? styles.inputError : null,
        rest.editable === false && styles.readOnly,
        style as any,
      ]}
      {...rest}
    />
    {error && <Text style={styles.error}>{error}</Text>}
    {note  && <Text style={styles.note}>{note}</Text>}
  </View>
);
 
interface SelectInputProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}
 
/** Componente de seleção simples baseado em botões de opção (iOS/Android-friendly) */
export const SelectInput: React.FC<SelectInputProps> = ({ label, value, options, onChange }) => (
  <View style={styles.wrapper}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.selectRow}>
      {options.map((opt) => (
        <View
          key={opt}
          style={[
            styles.chip,
            value === opt && styles.chipActive,
          ]}
        >
          <Text
            onPress={() => onChange(opt)}
            style={[styles.chipText, value === opt && styles.chipTextActive]}
          >
            {opt}
          </Text>
        </View>
      ))}
    </View>
  </View>
);
 
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    ...Typography.label,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  readOnly: {
    backgroundColor: Colors.background,
  },
  error: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 3,
  },
  note: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
 
