import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { Colors } from "../constants/config";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Container } from "../components/layout/container";
import { api } from "../lib/api";
import { getBadgeImage } from "../utils/badges";

interface Badge {
  topic_id: string;
  topic_title: string;
  level: number;
  title: string;
  icon_key: string;
  earned_at: string;
}

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
    loadBadges();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/profile/me");
      setProfile(res.data.data);
    } catch (err) {
      console.error("Load profile error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadBadges() {
    try {
      const res = await api.get("/profile/badges");
      setBadges(res.data.data);
    } catch (err) {
      console.error("Load badges error:", err);
    }
  }

  async function handleLogout() {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logout();
          } catch (err) {
            console.error("Logout error:", err);
            Alert.alert("Error", "Gagal logout. Silakan coba lagi.");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.username?.charAt(0).toUpperCase() ||
                  profile?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.username}>{profile?.username || "User"}</Text>
          <Text style={styles.email}>{profile?.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {profile?.total_attempts || 0}
              </Text>
              <Text style={styles.statLabel}>Kuis Selesai</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {profile?.badges_earned || 0}
              </Text>
              <Text style={styles.statLabel}>Badge</Text>
            </View>
          </View>
        </Card>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Badge Saya</Text>

          {badges.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Belum ada badge. Selesaikan kuis untuk mendapatkan badge!
              </Text>
            </Card>
          ) : (
            <View style={styles.badgeGrid}>
              {badges.map((badge, index) => (
                <Card key={index} style={styles.badgeCard}>
                  <Image
                    source={getBadgeImage(badge.icon_key)}
                    style={styles.badgeImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.badgeTitle} numberOfLines={2}>
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeTopic} numberOfLines={1}>
                    {badge.topic_title}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Logout Button */}
        <Button
          title={loggingOut ? "Keluar..." : "Keluar"}
          onPress={handleLogout}
          variant="danger"
          size="large"
          style={styles.logoutBtn}
          disabled={loggingOut}
        />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    fontFamily: "Galano-Bold",
    color: Colors.surface,
  },
  username: {
    fontSize: 24,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontFamily: "Galano-Bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeCard: {
    width: "48%",
    padding: 16,
    alignItems: "center",
  },
  badgeImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 14,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeTopic: {
    fontSize: 12,
    fontFamily: "Galano",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  logoutBtn: {
    marginBottom: 40,
  },
});
