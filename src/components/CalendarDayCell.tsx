import React, { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { HolidayCategory } from "../types/holiday";
import { CATEGORY_COLORS } from "../constants/colors";
import { useTheme } from "../hooks/useTheme";

interface Props {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  primaryCategory: HolidayCategory | null;
  onPress: () => void;
}

export function CalendarDayCell({
  day,
  isToday,
  isSelected,
  isCurrentMonth,
  primaryCategory,
  onPress,
}: Props) {
  const theme = useTheme();
  const dotColor = primaryCategory ? CATEGORY_COLORS[primaryCategory] : null;

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isToday) {
      pulseScale.value = withSequence(
        withTiming(1.08, { duration: 500 }),
        withTiming(1.0, { duration: 500 })
      );
    }
  }, [isToday]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const dayTextColor = !isCurrentMonth
    ? theme.isDark
      ? "#4B5563"
      : "#D1D5DB"
    : isToday
    ? "#FFFFFF"
    : isSelected
    ? "#FF6B35"
    : theme.textPrimary;

  return (
    <TouchableOpacity style={styles.cell} onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.circle,
          isToday && styles.todayCircle,
          isSelected && !isToday && styles.selectedCircle,
          pulseStyle,
        ]}
      >
        <Text style={[styles.dayText, { color: dayTextColor }]}>{day}</Text>
      </Animated.View>
      {dotColor ? (
        <Animated.View
          style={[styles.dot, { backgroundColor: dotColor }]}
        />
      ) : (
        <Animated.View style={styles.dotSpacer} />
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
  selectedCircle: {
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  dayText: {
    fontSize: 15,
    fontWeight: "500",
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
