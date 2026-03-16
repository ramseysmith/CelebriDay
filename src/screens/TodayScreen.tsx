import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { HolidayService } from "../services/HolidayService";
import { CATEGORY_COLORS } from "../constants/colors";

export function TodayScreen() {
  const todayEntry = HolidayService.getTodaysHolidays();
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.dateLabel}>{dateLabel}</Text>
      <Text style={styles.heading}>Today's Holidays</Text>

      {!todayEntry || todayEntry.holidays.length === 0 ? (
        <Text style={styles.empty}>No holidays found for today.</Text>
      ) : (
        todayEntry.holidays.map((holiday, idx) => {
          const color = CATEGORY_COLORS[holiday.category];
          return (
            <View key={idx} style={[styles.card, { borderLeftColor: color }]}>
              <Text style={styles.emoji}>{holiday.emoji}</Text>
              <Text style={styles.name}>{holiday.name}</Text>
              <Text style={styles.category}>{holiday.category.toUpperCase()}</Text>
              <Text style={styles.description}>{holiday.description}</Text>
              <Text style={styles.funFact}>Fun fact: {holiday.funFact}</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  dateLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  empty: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 10,
  },
  funFact: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    lineHeight: 19,
  },
});
