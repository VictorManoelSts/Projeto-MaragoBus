
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/theme';
 
export const Divider: React.FC<{ vertical?: number }> = ({ vertical = Spacing.md }) => (
  <View style={[styles.line, { marginVertical: vertical }]} />
);
 
const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
 
