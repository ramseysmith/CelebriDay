import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../hooks/useTheme";

interface Props {
  onUnlock: () => void;
}

export function LockedHolidayCard({ onUnlock }: Props) {
  const theme = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUnlock();
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderLeftColor: "#FF6B35",
        },
      ]}
    >
      <Text style={styles.lockEmoji}>🔒</Text>
      <Text style={[styles.headline, { color: theme.textPrimary }]}>
        Premium Feature
      </Text>
      <Text style={[styles.subtext, { color: theme.textSecondary }]}>
        Unlock past holidays with CelebriDay Premium
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Unlock Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  lockEmoji: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: "center",
  },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtext: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
