import { DayEntry, Holiday, HolidayCategory } from "../types/holiday";
import holidaysData from "../data/holidays.json";
import { MOVING_HOLIDAYS, getMovingHolidaysForDate } from "../data/movingHolidays";

const data = holidaysData as DayEntry[];

export class HolidayService {
  static getTodaysHolidays(): DayEntry | undefined {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return HolidayService.getHolidaysForDate(month, day, today.getFullYear());
  }

  // Moving holidays (Thanksgiving, Easter, Leap Day, ...) depend on the year
  // and are listed first since they are usually the headline of the day.
  static getHolidaysForDate(
    month: number,
    day: number,
    year: number = new Date().getFullYear()
  ): DayEntry | undefined {
    const fixed = data.find((entry) => entry.month === month && entry.day === day);
    const moving = getMovingHolidaysForDate(month, day, year);
    if (moving.length === 0) return fixed;
    return { month, day, holidays: [...moving, ...(fixed?.holidays ?? [])] };
  }

  static getMovingHolidayByName(name: string): Holiday | undefined {
    return MOVING_HOLIDAYS.find((m) => m.holiday.name === name)?.holiday;
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
      const entry = HolidayService.getHolidaysForDate(month, day, next.getFullYear());
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
