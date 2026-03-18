import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HolidayCategory } from "../types/holiday";
import { CATEGORY_COLORS } from "../constants/colors";

interface Props {
  category: HolidayCategory;
}

export function CategoryBadge({ category }: Props) {
  const color = CATEGORY_COLORS[category];
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.label}>{category.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
