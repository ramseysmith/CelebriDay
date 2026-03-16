import { DayEntry, Holiday, HolidayCategory } from "../types/holiday";
import holidaysData from "../data/holidays.json";

const data = holidaysData as DayEntry[];

export class HolidayService {
  static getTodaysHolidays(): DayEntry | undefined {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return HolidayService.getHolidaysForDate(month, day);
  }

  static getHolidaysForDate(month: number, day: number): DayEntry | undefined {
    return data.find((entry) => entry.month === month && entry.day === day);
  }

  static getUpcomingHolidays(count: number): DayEntry[] {
    const results: DayEntry[] = [];
    const today = new Date();

    for (let i = 1; i <= count + 30; i++) {
      if (results.length >= count) break;
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      const month = next.getMonth() + 1;
      const day = next.getDate();
      const entry = HolidayService.getHolidaysForDate(month, day);
      if (entry) {
        results.push(entry);
      }
    }

    return results;
  }

  static searchHolidays(query: string): Holiday[] {
    const lower = query.toLowerCase();
    const results: Holiday[] = [];

    for (const entry of data) {
      for (const holiday of entry.holidays) {
        if (
          holiday.name.toLowerCase().includes(lower) ||
          holiday.description.toLowerCase().includes(lower) ||
          holiday.category.toLowerCase().includes(lower)
        ) {
          results.push(holiday);
        }
      }
    }

    return results;
  }

  static getHolidaysByCategory(category: HolidayCategory): Holiday[] {
    const results: Holiday[] = [];
    for (const entry of data) {
      for (const holiday of entry.holidays) {
        if (holiday.category === category) {
          results.push(holiday);
        }
      }
    }
    return results;
  }

  static getAllHolidays(): DayEntry[] {
    return data;
  }

  static getRandomHoliday(): Holiday {
    const allHolidays: Holiday[] = [];
    for (const entry of data) {
      allHolidays.push(...entry.holidays);
    }
    const idx = Math.floor(Math.random() * allHolidays.length);
    return allHolidays[idx];
  }
}
