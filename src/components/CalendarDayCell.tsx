import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { HolidayCategory } from "../types/holiday";
import { CATEGORY_COLORS } from "../constants/colors";

interface Props {
  day: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  primaryCategory: HolidayCategory | null;
  onPress: () => void;
}

export function CalendarDayCell({
  day,
  isToday,
  isCurrentMonth,
  primaryCategory,
  onPress,
}: Props) {
  const dotColor = primaryCategory ? CATEGORY_COLORS[primaryCategory] : null;

  return (
    <TouchableOpacity style={styles.cell} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.circle, isToday && styles.todayCircle]}>
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.outsideMonth,
            isToday && styles.todayText,
          ]}
        >
          {day}
        </Text>
      </View>
      {dotColor ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : (
        <View style={styles.dotSpacer} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    minHeight: 52,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    backgroundColor: "#FF6B35",
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  outsideMonth: {
    color: "#D1D5DB",
  },
  todayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  dotSpacer: {
    width: 5,
    height: 5,
    marginTop: 2,
  },
});
