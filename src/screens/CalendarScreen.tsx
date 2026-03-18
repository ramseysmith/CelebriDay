import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CalendarGrid } from "../components/CalendarGrid";
import { HolidayBottomSheet } from "../components/HolidayBottomSheet";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarScreen() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<{
    month: number;
    day: number;
  } | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const goToPrevMonth = () => {
    setMonth((m) => {
      if (m === 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  };

  const goToNextMonth = () => {
    setMonth((m) => {
      if (m === 12) {
        setYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  };

  // Use a ref for navigate so PanResponder always sees the latest version
  const navigateRef = useRef({ goToPrevMonth, goToNextMonth });
  navigateRef.current = { goToPrevMonth, goToNextMonth };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 20 && Math.abs(gs.dy) < 40,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -60) navigateRef.current.goToNextMonth();
        else if (gs.dx > 60) navigateRef.current.goToPrevMonth();
      },
    })
  ).current;

  const handleDayPress = (m: number, d: number) => {
    setSelectedDate({ month: m, day: d });
    setSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.arrowBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.arrowBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <View {...panResponder.panHandlers}>
          <CalendarGrid month={month} year={year} onDayPress={handleDayPress} />
        </View>
      </View>

      <HolidayBottomSheet
        visible={sheetVisible}
        date={selectedDate}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  inner: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  arrowBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
});
