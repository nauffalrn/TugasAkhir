import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { Container } from "../components/layout/container";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loading } from "../components/ui/loading";
import { Colors } from "../constants/config";
import type { UserProfile, Badge } from "../types";

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const [profileRes, badgesRes] = await Promise.all([api.get("/profile/me"), api.get("/profile/badges")]);
      setProfile(profileRes.data.data);
      setBadges(badgesRes.data.data.badges);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/auth/login");
  }

  if (loading) return <Loading />;

  return (
    <Container scroll>
      <Text style={styles.title}>Profil</Text>

      <Card>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        {user?.username && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Username</Text>
            <Text style={styles.value}>{user.username}</Text>
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Statistik</Text>
        <Text style={styles.stat}>Soal dikerjakan: {profile?.stats.total_questions_answered || 0}</Text>
      </Card>

      <Text style={styles.sectionTitle}>Badge Koleksi</Text>
      {badges.length === 0 ? (
        <Text style={styles.empty}>Belum ada badge. Selesaikan kuis untuk mendapatkan badge!</Text>
      ) : (
        <FlatList
          data={badges}
          keyExtractor={(item, idx) => `${item.topic_id}-${item.level}-${idx}`}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.badgeTitle}>{item.title}</Text>
              <Text style={styles.badgeDate}>Diperoleh: {new Date(item.earned_at).toLocaleDateString("id-ID")}</Text>
            </Card>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Button title="Logout" onPress={handleLogout} variant="danger" />
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16, color: Colors.text },
  label: { fontSize: 12, color: Colors.textSecondary, textTransform: "uppercase" },
  value: { fontSize: 16, color: Colors.text, fontWeight: "600", marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 12, color: Colors.text },
  stat: { fontSize: 16, color: Colors.text },
  list: { gap: 12 },
  badgeTitle: { fontSize: 16, fontWeight: "600", color: Colors.text },
  badgeDate: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  empty: { fontSize: 14, color: Colors.textSecondary, fontStyle: "italic" },
});