import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Share, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Holiday } from "../types/holiday";
import { CATEGORY_COLORS } from "../constants/colors";
import { CategoryBadge } from "./CategoryBadge";

interface Props {
  holiday: Holiday;
  index: number;
  onShare?: () => void;
  onFavorite?: () => void;
}

export function HolidayCard({ holiday, index, onShare, onFavorite }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const color = CATEGORY_COLORS[holiday.category];

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    const delay = index * 120;
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: holiday.shareText });
    } catch {
      // ignore cancelled share
    }
    onShare?.();
  };

  const handleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite((prev) => !prev);
    onFavorite?.();
  };

  return (
    <Animated.View style={[styles.card, { borderLeftColor: color }, animatedStyle]}>
      <Text style={styles.emoji}>{holiday.emoji}</Text>
      <Text style={styles.name}>{holiday.name}</Text>
      <CategoryBadge category={holiday.category} />
      <Text style={styles.description}>{holiday.description}</Text>
      <Text style={styles.funFact}>💡 {holiday.funFact}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color="#6B7280" />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
          <Text style={[styles.actionLabel, isFavorite && styles.favoriteLabel]}>
            {isFavorite ? "Saved" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 23,
    marginBottom: 10,
  },
  funFact: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  favoriteLabel: {
    color: "#EF4444",
  },
});
