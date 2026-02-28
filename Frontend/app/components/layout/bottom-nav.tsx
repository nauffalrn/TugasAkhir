import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/config";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Materi",
      icon: "book",
      iconOutline: "book-outline",
      route: "/tabs/materi",
    },
    {
      name: "Kuis",
      icon: "game-controller",
      iconOutline: "game-controller-outline",
      route: "/tabs/kuis",
    },
    {
      name: "Profil",
      icon: "person",
      iconOutline: "person-outline",
      route: "/tabs/profil",
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname.includes(tab.route.replace("/tabs/", ""));
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isActive ? tab.icon : tab.iconOutline) as any}
              size={24}
              color={isActive ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    height: Platform.OS === "ios" ? 88 : 64,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Galano-Bold",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  labelActive: {
    color: Colors.primary,
  },
});
