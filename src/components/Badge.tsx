import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../constants/theme';
 
interface BadgeProps {
  label: string;
  color?: string;
}
 
export const Badge: React.FC<BadgeProps> = ({ label, color = Colors.primary }) => (
  <View style={[styles.container, { backgroundColor: color + '22', borderColor: color + '55' }]}>
    <Text style={[styles.text, { color }]}>{label}</Text>
  </View>
);
 
const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
 
