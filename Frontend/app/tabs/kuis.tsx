import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { api } from "../lib/api";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import type { Topic } from "../types";

export default function KuisScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    try {
      const res = await api.get("/topics");
      setTopics(res.data.data.topics);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <Container scroll>
      <Text style={styles.title}>Pilih Materi Kuis</Text>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/kuis/select-level?slug=${item.slug}`)}>
            <Card>
              <Text style={styles.topicTitle}>{item.title}</Text>
              <Text style={styles.topicSubtitle}>Tap untuk pilih level</Text>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16, color: Colors.text },
  list: { gap: 12 },
  topicTitle: { fontSize: 18, fontWeight: "600", color: Colors.text },
  topicSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});