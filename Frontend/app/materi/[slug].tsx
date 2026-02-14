import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "../lib/api";
import { Container } from "../components/layout/container";
import { Button } from "../components/ui/button";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import type { Topic } from "../types";

export default function MateriDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopic();
  }, [slug]);

  async function loadTopic() {
    try {
      const res = await api.get(`/topics/${slug}`);
      setTopic(res.data.data.topic);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;
  if (!topic) return <Text>Topic tidak ditemukan</Text>;

  return (
    <Container scroll>
      <Text style={styles.title}>{topic.title}</Text>

      {topic.content_images.length > 0 ? (
        topic.content_images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.image} resizeMode="contain" />
        ))
      ) : (
        <Text style={styles.placeholder}>Materi belum tersedia (gambar akan ditambahkan)</Text>
      )}

      <Button title="Mulai Kuis" onPress={() => router.push(`/kuis/select-level?slug=${slug}`)} />
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: Colors.text },
  image: { width: "100%", height: 300, marginBottom: 16, backgroundColor: Colors.border },
  placeholder: { fontSize: 14, color: Colors.textSecondary, fontStyle: "italic", marginBottom: 16 },
});