import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/theme';
 
interface AvatarProps {
  iniciais: string;
  uri?: string | null;
  size?: number;
  backgroundColor?: string;
}
 
export const Avatar: React.FC<AvatarProps> = ({
  iniciais, uri, size = 40, backgroundColor = Colors.primary,
}) => {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
 
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{iniciais}</Text>
    </View>
  );
};
 
const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
