import { Colors } from '@/app/_constants/config';
import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  iconRight?: React.ReactNode;
}

export function Input({ iconRight, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textSecondary}
        {...props}
      />
      {iconRight && <View style={styles.iconContainer}>{iconRight}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    color: Colors.text,
    fontFamily: "Galano",
    fontSize: 16,
  },
  iconContainer: {
    paddingLeft: 8,
  },
});
