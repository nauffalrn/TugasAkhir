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
    <Container scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 Materi Pembelajaran</Text>
          <Text style={styles.subtitle}>
            Pilih materi yang ingin kamu pelajari
          </Text>
        </View>

        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/materi/${item.slug}`)}
              style={styles.topicCardWrapper}
            >
              <Card style={styles.topicCard}>
                <Text style={styles.topicTitle}>{item.title}</Text>
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
  topicCardWrapper: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.lightPink + "30",
  },
  topicCard: {
    padding: 16,
    borderRadius: 12,
  },
  topicTitle: {
    fontSize: 18,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
});
