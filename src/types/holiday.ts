export type HolidayCategory =
  | "food"
  | "awareness"
  | "fun"
  | "cultural"
  | "nature"
  | "tech"
  | "health"
  | "arts"
  | "sports"
  | "other";

export interface Holiday {
  name: string;
  description: string;
  funFact: string;
  emoji: string;
  category: HolidayCategory;
  shareText: string;
  affiliateUrl?: string;
}

export interface DayEntry {
  month: number;
  day: number;
  holidays: Holiday[];
}

export type CategoryColors = Record<HolidayCategory, string>;
