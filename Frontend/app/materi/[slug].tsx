import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import type { Topic } from "../types";
import { Ionicons } from "@expo/vector-icons";

export default function MateriDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopic();
  }, []);

  async function loadTopic() {
    try {
      const res = await api.get(`/topics/${slug}`);
      setTopic(res.data.data);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  function startQuiz() {
    router.push(`/kuis/select-level?slug=${slug}`);
  }

  if (loading) return <Loading />;
  if (!topic) return <Text>Topic tidak ditemukan</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{topic.title}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {topic.content_images.length > 0 ? (
          topic.content_images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={styles.image}
              resizeMode="contain"
            />
          ))
        ) : (
          <Text style={styles.placeholder}>
            Materi belum tersedia (gambar akan ditambahkan)
          </Text>
        )}

        <Button title="Mulai Kuis" onPress={startQuiz} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 16,
    backgroundColor: Colors.border,
    borderRadius: 16,
  },
  placeholder: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
    padding: 20,
  },
});
