import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/config";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ title, onPress, loading, variant = "primary" }: Props) {
  const bgColor = variant === "primary" ? Colors.primary : variant === "secondary" ? Colors.secondary : Colors.danger;

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: bgColor }]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 16, borderRadius: 8, alignItems: "center" },
  text: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});