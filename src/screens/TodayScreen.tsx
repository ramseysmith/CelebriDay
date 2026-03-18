import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { HolidayService } from "../services/HolidayService";
import { HolidayCard } from "../components/HolidayCard";
import { Holiday } from "../types/holiday";

export function TodayScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayEntry = HolidayService.getTodaysHolidays();
  const holidays: Holiday[] = todayEntry?.holidays ?? [];

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 600);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.dateLabel}>{dateLabel}</Text>
      <Text style={styles.subtitle}>Today's Celebrations</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={styles.emptyText}>
        No celebrations found for today. Check back tomorrow!
      </Text>
    </View>
  );

  return (
    <FlatList
      key={refreshKey}
      style={styles.container}
      contentContainerStyle={styles.content}
      data={holidays}
      keyExtractor={(_, idx) => String(idx)}
      renderItem={({ item, index }) => (
        <HolidayCard holiday={item} index={index} />
      )}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FF6B35"
          colors={["#FF6B35"]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  dateLabel: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
