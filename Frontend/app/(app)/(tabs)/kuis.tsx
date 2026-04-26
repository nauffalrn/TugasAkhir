import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { api } from "../../_lib/api";
import { Loading } from "../../_components/ui/loading";
import { Colors } from "../../_constants/config";
import type { Topic } from "../../_types";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");
const cardHeight = (height - 200) / 2;

const cardColors = [
  "#82E0AA",
  "#F5B7B1",
  "#7FB3D5",
  "#D7BDE2",
  "#E59866",
  "#F1C40F",
];

const kuisIcons = ["time", "shapes", "stats-chart", "keypad"];

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Kuis & Evaluasi</Text>
        <Text style={styles.headerSubtitle}>
          Uji pemahamanmu pada topik pilihan
        </Text>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => {
          const bgColor = cardColors[index % cardColors.length];
          const iconName = kuisIcons[index % kuisIcons.length] as any;
          return (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/kuis/select-level?topic_id=${item.id}&topic_slug=${item.slug}&title=${item.title}`,
                )
              }
              style={[styles.topicCard, { backgroundColor: bgColor }]}
              activeOpacity={0.8}
            >
              <View>
                <View style={styles.iconCircle}>
                  <Ionicons name={iconName} size={28} color="#1A1A1A" />
                </View>
                <Text style={styles.topicTitle} numberOfLines={3}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.topicFooter}>
                <Text style={styles.topicAction}>PLAY</Text>
                <Ionicons name="play" size={16} color="#FFFFFF" />
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
    backgroundColor: "#F2F2F2",
    paddingTop: 50,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#F2F2F2",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Galano-Bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Galano",
    color: "#7F8C8D",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  topicCard: {
    width: "47%",
    height: cardHeight,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 15,
    fontFamily: "Galano-Bold",
    fontWeight: "bold",
    color: "#1A1A1A",
    textTransform: "uppercase",
    lineHeight: 22,
  },
  topicFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  topicAction: {
    fontSize: 12,
    fontFamily: "Galano-Bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});
