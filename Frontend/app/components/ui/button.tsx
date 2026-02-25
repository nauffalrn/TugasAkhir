import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors } from "../../constants/config";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "small" | "medium" | "large";
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  size = "medium",
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.primary : "#FFFFFF"}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  button_small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  button_primary: {
    backgroundColor: Colors.primary,
  },
  button_secondary: {
    backgroundColor: Colors.secondary,
  },
  button_success: {
    backgroundColor: Colors.success,
  },
  button_danger: {
    backgroundColor: Colors.danger,
  },
  button_outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontFamily: "Galano-Bold",
    fontWeight: "700",
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  text_primary: {
    color: "#FFFFFF",
  },
  text_secondary: {
    color: "#2D3748",
  },
  text_success: {
    color: "#FFFFFF",
  },
  text_danger: {
    color: "#FFFFFF",
  },
  text_outline: {
    color: Colors.primary,
  },
  textDisabled: {
    color: Colors.textLight,
  },
});
