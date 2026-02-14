import React, { ReactNode } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Colors } from "../../constants/config";

export function Container({ children, scroll = false }: { children: ReactNode; scroll?: boolean }) {
  const Wrapper = scroll ? ScrollView : View;
  return <Wrapper style={styles.container}>{children}</Wrapper>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
});