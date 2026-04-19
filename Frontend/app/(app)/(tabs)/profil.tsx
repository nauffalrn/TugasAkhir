import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../_hooks/useAuth";
import { Colors } from "../../_constants/config";
import { Card } from "../../_components/ui/card";
import { Button } from "../../_components/ui/button";
import { Container } from "../../_components/layout/container";
import { api } from "../../_lib/api";
import { getBadgeImage } from "../../_utils/badges";

interface Badge {
  topic_id: string;
  topic_title: string;
  topic_slug: string;
  level: number;
  title: string;
  icon_key: string;
  earned_at: string;
}

interface GroupedBadge {
  topic_id: string;
  topic_title: string;
  topic_slug: string;
  highestLevel: number;
  badges: Badge[];
}

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [groupedBadges, setGroupedBadges] = useState<GroupedBadge[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const isMounted = useRef(false);

  useEffect(() => {
    loadProfile();
    loadBadges();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      loadProfile();
      loadBadges();
    }, []),
  );

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
      const badgeData: Badge[] = res.data.data;
      setBadges(badgeData);

      const groupMap = new Map<string, GroupedBadge>();
      badgeData.forEach((badge) => {
        if (!groupMap.has(badge.topic_id)) {
          groupMap.set(badge.topic_id, {
            topic_id: badge.topic_id,
            topic_title: badge.topic_title,
            topic_slug: badge.topic_slug,
            highestLevel: badge.level,
            badges: [badge],
          });
        } else {
          const group = groupMap.get(badge.topic_id)!;
          group.badges.push(badge);
          if (badge.level > group.highestLevel) {
            group.highestLevel = badge.level;
          }
        }
      });

      setGroupedBadges(Array.from(groupMap.values()));
    } catch (err) {
      console.error("Load badges error:", err);
    }
  }

  function toggleExpand(topicId: string) {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  }

  const levelLabels: Record<number, string> = {
    1: "Pemula",
    2: "Mahir",
    3: "Expert",
    4: "Master",
  };

  async function handleLogout() {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
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
        <Card style={styles.profileCard}>
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
              <Text style={styles.statNumber}>{badges.length}</Text>
              <Text style={styles.statLabel}>Badge</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Badge Saya</Text>

          {groupedBadges.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Belum ada badge. Selesaikan kuis untuk mendapatkan badge!
              </Text>
            </Card>
          ) : (
            groupedBadges.map((group) => {
              const highestBadge = group.badges.reduce((prev, curr) =>
                curr.level > prev.level ? curr : prev,
              );

              const isExpanded = expandedTopics.has(group.topic_id);

              return (
                <Card key={group.topic_id} style={styles.badgeGroupCard}>
                  <TouchableOpacity
                    onPress={() => toggleExpand(group.topic_id)}
                    style={styles.badgeGroupHeader}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={getBadgeImage(highestBadge.icon_key)}
                      style={styles.badgeImageLarge}
                      resizeMode="contain"
                    />
                    <View style={styles.badgeGroupInfo}>
                      <Text style={styles.badgeGroupTopic}>
                        {group.topic_title}
                      </Text>
                      <Text style={styles.badgeGroupLevel}>
                        🏅 {levelLabels[group.highestLevel]} (Level{" "}
                        {group.highestLevel})
                      </Text>
                    </View>
                    <Text style={styles.expandIcon}>
                      {isExpanded ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.badgeSubList}>
                      {group.badges
                        .sort((a, b) => a.level - b.level)
                        .map((badge) => (
                          <View key={badge.level} style={styles.badgeSubItem}>
                            <Image
                              source={getBadgeImage(badge.icon_key)}
                              style={styles.badgeImageSmall}
                              resizeMode="contain"
                            />
                            <View>
                              <Text style={styles.badgeSubTitle}>
                                Level {badge.level} - {levelLabels[badge.level]}
                              </Text>
                              <Text style={styles.badgeSubDate}>
                                {new Date(badge.earned_at).toLocaleDateString(
                                  "id-ID",
                                )}
                              </Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>

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
  badgeGroupCard: {
    padding: 16,
    marginBottom: 12,
  },
  badgeGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeImageLarge: {
    width: 70,
    height: 70,
  },
  badgeGroupInfo: {
    flex: 1,
  },
  badgeGroupTopic: {
    fontSize: 16,
    fontFamily: "Galano-Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  badgeGroupLevel: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.primary,
    marginBottom: 2,
  },
  expandIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badgeSubList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  badgeSubItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
  },
  badgeImageSmall: {
    width: 44,
    height: 44,
  },
  badgeSubTitle: {
    fontSize: 14,
    fontFamily: "Galano-SemiBold",
    color: Colors.text,
  },
  badgeSubDate: {
    fontSize: 12,
    fontFamily: "Galano",
    color: Colors.textSecondary,
  },
  logoutBtn: {
    marginBottom: 40,
  },
});
