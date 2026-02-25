import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { api } from "../lib/api";
import { Container } from "../components/layout/container";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import type { Topic } from "../types";
import { Ionicons } from "@expo/vector-icons";

const topicColors = [
  { bg: Colors.accent3, light: Colors.successLight },
  { bg: Colors.accent5, light: Colors.primaryLight },
  { bg: Colors.accent2, light: Colors.secondaryLight },
  { bg: Colors.accent1, light: Colors.dangerLight },
  { bg: Colors.accent4, light: Colors.infoLight },
  { bg: Colors.accent6, light: "#EDE9FE" },
];

export default function MateriScreen() {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Materi Belajar</Text>
        <Text style={styles.headerSubtitle}>
          Pilih topik yang ingin kamu pelajari
        </Text>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const color = topicColors[index % topicColors.length];
          return (
            <TouchableOpacity
              onPress={() => router.push(`/materi/${item.slug}`)}
              style={styles.topicCardWrapper}
              activeOpacity={0.8}
            >
              <View
                style={[styles.topicCard, { backgroundColor: color.light }]}
              >
                <View style={styles.topicHeader}>
                  <View
                    style={[styles.iconCircle, { backgroundColor: color.bg }]}
                  >
                    <Ionicons name="book" size={24} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.topicTitle}>{item.title}</Text>
                <View style={styles.topicFooter}>
                  <Text style={[styles.topicAction, { color: color.bg }]}>
                    Pelajari Sekarang
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={color.bg} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  topicCardWrapper: {
    marginBottom: 16,
  },
  topicCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  topicTitle: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 28,
  },
  topicFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicAction: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
  },
});
