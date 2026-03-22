import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CalendarGrid } from "../components/CalendarGrid";
import { HolidayCard } from "../components/HolidayCard";
import { HolidayService } from "../services/HolidayService";
import { useFavorites } from "../hooks/useFavorites";
import { useTheme } from "../hooks/useTheme";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarScreen() {
  const navigation = useNavigation<NavProp>();
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<{
    month: number;
    day: number;
  } | null>({ month: today.getMonth() + 1, day: today.getDate() });

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate({ month: m, day: d });
  };

  const entry = selectedDate
    ? HolidayService.getHolidaysForDate(selectedDate.month, selectedDate.day)
    : null;

  const arrowBtnBg = theme.isDark ? "#374151" : "#F3F4F6";
  const panelBg = theme.isDark ? "#1F2937" : "#FFFFFF";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Calendar section */}
      <View style={styles.calendarSection}>
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={[styles.arrowBtn, { backgroundColor: arrowBtnBg }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={[styles.arrowBtn, { backgroundColor: arrowBtnBg }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <View {...panResponder.panHandlers}>
          <CalendarGrid
            month={month}
            year={year}
            onDayPress={handleDayPress}
            selectedDay={selectedDate}
          />
        </View>
      </View>

      {/* Static holiday panel */}
      <View style={[styles.panel, { backgroundColor: panelBg, borderTopColor: theme.border }]}>
        {selectedDate ? (
          <>
            <Text style={[styles.panelDateLabel, { color: theme.textPrimary }]}>
              {MONTH_NAMES[selectedDate.month - 1]} {selectedDate.day}
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.panelScroll}
            >
              {entry && entry.holidays.length > 0 ? (
                entry.holidays.map((holiday, idx) => (
                  <HolidayCard
                    key={idx}
                    holiday={holiday}
                    index={idx}
                    month={selectedDate.month}
                    day={selectedDate.day}
                    isFavorited={isFavorite(selectedDate.month, selectedDate.day, holiday.name)}
                    onToggleFavorite={() =>
                      toggleFavorite(selectedDate.month, selectedDate.day, holiday.name)
                    }
                    onOpenPaywall={() => navigation.navigate("Paywall")}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No celebrations found for this day.
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👆</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Tap a day to see its celebrations
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarSection: {
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
  },
  arrowBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  panel: {
    flex: 1,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 12,
    paddingTop: 16,
  },
  panelDateLabel: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  panelScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
});
