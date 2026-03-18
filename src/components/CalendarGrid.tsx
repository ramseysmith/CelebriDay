import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HolidayService } from "../services/HolidayService";
import { CalendarDayCell } from "./CalendarDayCell";
import { HolidayCategory } from "../types/holiday";

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

interface CellData {
  day: number;
  isCurrentMonth: boolean;
  month: number;
  year: number;
}

interface Props {
  month: number; // 1-indexed
  year: number;
  onDayPress: (month: number, day: number) => void;
}

export function CalendarGrid({ month, year, onDayPress }: Props) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();
  const todayDay = today.getDate();

  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const cells: CellData[] = [];

  // Previous month fill
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    cells.push({ day: d, isCurrentMonth: false, month: m, year: y });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, month, year });
  }

  // Next month fill to complete the last row
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  if (remaining > 0) {
    const nextM = month === 12 ? 1 : month + 1;
    const nextY = month === 12 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, isCurrentMonth: false, month: nextM, year: nextY });
    }
  }

  // Chunk into rows of 7
  const rows: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View>
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((h, i) => (
          <View key={i} style={styles.headerCell}>
            <Text style={styles.headerText}>{h}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((cell, cellIdx) => {
            const entry = cell.isCurrentMonth
              ? HolidayService.getHolidaysForDate(cell.month, cell.day)
              : null;
            const primaryCategory =
              entry && entry.holidays.length > 0
                ? (entry.holidays[0].category as HolidayCategory)
                : null;
            const isToday =
              cell.isCurrentMonth &&
              cell.day === todayDay &&
              cell.month === todayMonth &&
              cell.year === todayYear;

            return (
              <CalendarDayCell
                key={cellIdx}
                day={cell.day}
                isToday={isToday}
                isCurrentMonth={cell.isCurrentMonth}
                primaryCategory={primaryCategory}
                onPress={() => onDayPress(cell.month, cell.day)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  row: {
    flexDirection: "row",
  },
});
