import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Holiday } from "../types/holiday";
import { HolidayService } from "../services/HolidayService";

const STORAGE_KEY = "favoriteHolidays";

function makeId(month: number, day: number, name: string): string {
  return `${month}-${day}-${name}`;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setFavorites(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback(async (next: string[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isFavorite = useCallback(
    (month: number, day: number, name: string) =>
      favorites.includes(makeId(month, day, name)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (month: number, day: number, name: string) => {
      const id = makeId(month, day, name);
      setFavorites((prev) => {
        const next = prev.includes(id)
          ? prev.filter((f) => f !== id)
          : [...prev, id];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const getFavoriteHolidays = useCallback((): Array<{
    holiday: Holiday;
    month: number;
    day: number;
  }> => {
    return favorites.flatMap((id) => {
      const dashIdx = id.indexOf("-", id.indexOf("-") + 1);
      const prefix = id.slice(0, dashIdx);
      const name = id.slice(dashIdx + 1);
      const [monthStr, dayStr] = prefix.split("-");
      const month = Number(monthStr);
      const day = Number(dayStr);
      const entry = HolidayService.getHolidaysForDate(month, day);
      if (!entry) return [];
      const holiday = entry.holidays.find((h) => h.name === name);
      if (!holiday) return [];
      return [{ holiday, month, day }];
    });
  }, [favorites]);

  return { favorites, isFavorite, toggleFavorite, getFavoriteHolidays };
}
