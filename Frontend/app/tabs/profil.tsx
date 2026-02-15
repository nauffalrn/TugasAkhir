import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
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
      const [profileRes, badgesRes] = await Promise.all([
        api.get("/profile/me"),
        api.get("/profile/badges"),
      ]);
      setProfile(profileRes.data.data);
      setBadges(badgesRes.data.data.badges);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Logout", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  }

  if (loading) return <Loading />;

  return (
    <Container scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
            {user?.username && (
              <>
                <Text style={[styles.label, { marginTop: 16 }]}>Username</Text>
                <Text style={styles.value}>{user.username}</Text>
              </>
            )}
          </View>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>📊 Statistik</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile?.stats.total_questions_answered || 0}
              </Text>
              <Text style={styles.statLabel}>Soal Dikerjakan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{badges.length}</Text>
              <Text style={styles.statLabel}>Badge Diraih</Text>
            </View>
          </View>
        </Card>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🏆 Koleksi Badge</Text>
          {badges.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.empty}>
                Belum ada badge. Selesaikan kuis untuk mendapatkan badge!
              </Text>
            </Card>
          ) : (
            <FlatList
              data={badges}
              keyExtractor={(item, idx) =>
                `${item.topic_id}-${item.level}-${idx}`
              }
              renderItem={({ item }) => (
                <Card style={styles.badgeCard}>
                  <View style={styles.badgeContent}>
                    <Text style={styles.badgeEmoji}>🏅</Text>
                    <View style={styles.badgeInfo}>
                      <Text style={styles.badgeTitle}>{item.title}</Text>
                      <Text style={styles.badgeDate}>
                        {new Date(item.earned_at).toLocaleDateString("id-ID")}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}
              contentContainerStyle={styles.badgeList}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
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
  },
  userCard: {
    backgroundColor: Colors.softYellow,
    marginBottom: 16,
  },
  userInfo: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontFamily: "Galano-SemiBold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
  },
  statsCard: {
    backgroundColor: Colors.softYellow,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Galano-ExtraBold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  badgesSection: {
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: Colors.softYellow,
    padding: 24,
  },
  empty: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  badgeList: {
    gap: 12,
  },
  badgeCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    backgroundColor: Colors.softYellow,
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  logoutContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutBtn: {
    backgroundColor: Colors.danger,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.card,
  },
});
