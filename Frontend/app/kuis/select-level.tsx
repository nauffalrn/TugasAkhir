import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Colors } from "../constants/config";

const LEVELS = [
  { level: 1, label: "Level 1 - Pemula", desc: "Tanpa batas waktu, ada hint" },
  { level: 2, label: "Level 2 - Penjelajah", desc: "Tanpa batas waktu" },
  { level: 3, label: "Level 3 - Ahli", desc: "Batas waktu 10 menit" },
  { level: 4, label: "Level 4 - Master", desc: "Batas waktu 5 menit" },
];

export default function SelectLevel() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  function startQuiz(level: number) {
    router.push(`/kuis/attempt?slug=${slug}&level=${level}`);
  }

  return (
    <Container scroll>
      <Text style={styles.title}>Pilih Level</Text>
      {LEVELS.map((item) => (
        <TouchableOpacity key={item.level} onPress={() => startQuiz(item.level)}>
          <Card>
            <Text style={styles.levelLabel}>{item.label}</Text>
            <Text style={styles.levelDesc}>{item.desc}</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: Colors.text },
  levelLabel: { fontSize: 18, fontWeight: "600", color: Colors.text },
  levelDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});