import { StyleSheet } from 'react-native';
 
// ─────────────────────────────────────────────────────────────────────────────
//  PALETTE
// ─────────────────────────────────────────────────────────────────────────────
export const Colors = {
  primary:      '#4a9cd0',
  primaryDark:  '#2d7aad',
  primaryLight: '#e8f4fb',
  primaryMid:   '#b8ddf0',
 
  white:        '#ffffff',
  background:   '#f7fafd',
  card:         '#ffffff',
 
  text:         '#1a2e3b',
  textSecondary:'#6b8fa8',
  border:       '#d6eaf5',
 
  success:      '#27ae60',
  successLight: '#eafaf1',
  danger:       '#e74c3c',
  dangerLight:  '#fdf2f2',
  warning:      '#f39c12',
  warningLight: '#fff8e1',
} as const;
 
// ─────────────────────────────────────────────────────────────────────────────
//  TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────
export const Typography = {
  h1: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  h3: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.text },
  small: { fontSize: 12, fontWeight: '400' as const, color: Colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
};
 
// ─────────────────────────────────────────────────────────────────────────────
//  SPACING
// ─────────────────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;
 
// ─────────────────────────────────────────────────────────────────────────────
//  RADIUS
// ─────────────────────────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;
 
// ─────────────────────────────────────────────────────────────────────────────
//  SHADOWS (Android + iOS)
// ─────────────────────────────────────────────────────────────────────────────
export const Shadow = StyleSheet.create({
  card: {
    shadowColor: '#4a9cd0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
});
