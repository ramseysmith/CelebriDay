import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { HolidayService } from "../services/HolidayService";
import { HolidayCard } from "./HolidayCard";
import { useTheme } from "../hooks/useTheme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  visible: boolean;
  date: { month: number; day: number } | null;
  onClose: () => void;
}

export function HolidayBottomSheet({ visible, date, onClose }: Props) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["55%", "90%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const entry = date
    ? HolidayService.getHolidaysForDate(date.month, date.day)
    : null;
  const dateLabel = date
    ? `${MONTH_NAMES[date.month - 1]} ${date.day}`
    : "";

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      backgroundStyle={[
        styles.background,
        { backgroundColor: theme.cardBackground },
      ]}
      handleIndicatorStyle={[
        styles.indicator,
        { backgroundColor: theme.border },
      ]}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {dateLabel ? (
          <Text style={[styles.dateHeader, { color: theme.textPrimary }]}>
            {dateLabel}
          </Text>
        ) : null}
        {entry && entry.holidays.length > 0 ? (
          entry.holidays.map((holiday, idx) => (
            <HolidayCard key={idx} holiday={holiday} index={idx} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No celebrations found for this day.
            </Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    borderRadius: 24,
  },
  indicator: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateHeader: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: 8,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
  },
});
