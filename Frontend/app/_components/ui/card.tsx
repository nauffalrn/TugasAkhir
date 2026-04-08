import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "../../_constants/config";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "outlined" | "flat";
}

export function Card({ children, style, variant = "elevated" }: CardProps) {
  return (
    <View style={[styles.card, styles[`card_${variant}`], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
  },
  card_default: {
    backgroundColor: Colors.surface,
  },
  card_elevated: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  card_outlined: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  card_flat: {
    backgroundColor: Colors.surfaceVariant,
  },
});
