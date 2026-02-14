import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";
import { Colors } from "../../constants/config";

export function Input(props: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor={Colors.textSecondary} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.card,
  },
});