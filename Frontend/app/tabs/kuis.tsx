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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎮 Kuis</Text>
          <Text style={styles.subtitle}>Uji kemampuanmu dengan kuis seru!</Text>
        </View>

        <FlatList
          data={topics}
          keyExtractor={(item) => item.slug}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/kuis/select-level?slug=${item.slug}`)
              }
              activeOpacity={0.7}
            >
              <Card style={styles.topicCard}>
                <View style={styles.topicHeader}>
                  <Text style={styles.quizIcon}>📝</Text>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicTitle}>{item.title}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  topicCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    backgroundColor: Colors.peach + "30",
  },
  topicHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quizIcon: {
    fontSize: 36,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  topicSubtitle: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
});
