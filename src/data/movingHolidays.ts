import { Holiday } from "../types/holiday";

// Holidays whose date changes every year. Each rule resolves to a concrete
// month and day for a given year. Text fields follow the same no dash rule as
// holidays_*.json.

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

type DateRule =
  | { kind: "nthWeekday"; month: number; weekday: Weekday; n: number; offsetDays?: number }
  | { kind: "lastWeekday"; month: number; weekday: Weekday }
  | { kind: "easter"; offsetDays: number }
  | { kind: "leapDay" };

export interface MovingHoliday {
  rule: DateRule;
  holiday: Holiday;
}

// Anonymous Gregorian algorithm.
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function resolveRule(rule: DateRule, year: number): Date | null {
  switch (rule.kind) {
    case "nthWeekday": {
      const first = new Date(year, rule.month - 1, 1);
      const delta = (rule.weekday - first.getDay() + 7) % 7;
      const day = 1 + delta + (rule.n - 1) * 7 + (rule.offsetDays ?? 0);
      return new Date(year, rule.month - 1, day);
    }
    case "lastWeekday": {
      const last = new Date(year, rule.month, 0);
      const delta = (last.getDay() - rule.weekday + 7) % 7;
      return new Date(year, rule.month - 1, last.getDate() - delta);
    }
    case "easter": {
      const date = easterSunday(year);
      date.setDate(date.getDate() + rule.offsetDays);
      return date;
    }
    case "leapDay": {
      const date = new Date(year, 1, 29);
      return date.getMonth() === 1 ? date : null;
    }
  }
}

const THANKSGIVING: DateRule = { kind: "nthWeekday", month: 11, weekday: 4, n: 4 };

export const MOVING_HOLIDAYS: MovingHoliday[] = [
  {
    rule: { kind: "nthWeekday", month: 2, weekday: 0, n: 2 },
    holiday: {
      name: "Super Bowl Sunday",
      description: "The biggest day in American football, packed with snacks, commercials, and a halftime show watched by millions.",
      funFact: "Super Bowl Sunday is the second largest day of food consumption in the United States, right behind Thanksgiving.",
      emoji: "🏈",
      category: "sports",
      shareText: "Snacks ready, jersey on. Happy Super Bowl Sunday! 🏈 #SuperBowlSunday #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 2, weekday: 1, n: 3 },
    holiday: {
      name: "Presidents Day",
      description: "A federal holiday honoring George Washington and all the presidents who have led the United States.",
      funFact: "The holiday began in 1885 as a celebration of Washington's birthday and was moved to a Monday in 1971, so it never lands on his actual birthday of February 22.",
      emoji: "🇺🇸",
      category: "cultural",
      shareText: "Honoring the leaders who shaped the nation this Presidents Day! 🇺🇸 #PresidentsDay #CelebriDay",
    },
  },
  {
    rule: { kind: "leapDay" },
    holiday: {
      name: "Leap Day",
      description: "The bonus day that shows up once every four years to keep our calendar in step with the Earth's orbit around the Sun.",
      funFact: "The odds of being born on February 29 are about 1 in 1,461, and there are roughly 5 million leap day babies in the world.",
      emoji: "🐸",
      category: "fun",
      shareText: "A whole bonus day! Making the most of Leap Day. 🐸 #LeapDay #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 3, weekday: 0, n: 2 },
    holiday: {
      name: "Daylight Saving Time Begins",
      description: "Clocks spring forward one hour tonight, trading a little sleep for longer, brighter evenings.",
      funFact: "Benjamin Franklin joked about saving daylight in 1784, but the United States did not adopt daylight saving time nationwide until 1918.",
      emoji: "⏰",
      category: "other",
      shareText: "Spring forward! Hello to brighter evenings this Daylight Saving Time. ⏰ #DaylightSaving #CelebriDay",
    },
  },
  {
    rule: { kind: "easter", offsetDays: -47 },
    holiday: {
      name: "Mardi Gras",
      description: "Also known as Fat Tuesday, a festive day of parades, beads, and rich food before the season of Lent begins.",
      funFact: "New Orleans hosts more than 70 parades during the Mardi Gras season, and riders toss out an estimated 25 million pounds of beads.",
      emoji: "🎭",
      category: "cultural",
      shareText: "Laissez les bons temps rouler! Happy Mardi Gras! 🎭 #MardiGras #CelebriDay",
    },
  },
  {
    rule: { kind: "easter", offsetDays: 0 },
    holiday: {
      name: "Easter Sunday",
      description: "A joyful spring holiday celebrated with church services, family meals, egg hunts, and plenty of chocolate.",
      funFact: "Americans buy around 90 million chocolate bunnies each Easter, and most people bite the ears off first.",
      emoji: "🐣",
      category: "cultural",
      shareText: "Egg hunts, sweet treats, and time with loved ones. Happy Easter! 🐣 #Easter #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 5, weekday: 0, n: 2 },
    holiday: {
      name: "Mothers Day",
      description: "A day to honor moms and the mother figures in our lives for their love, patience, and endless support.",
      funFact: "Anna Jarvis founded Mother's Day in 1908 and later campaigned against it after it became too commercial.",
      emoji: "💐",
      category: "cultural",
      shareText: "To every mom and mother figure out there, thank you for everything. Happy Mother's Day! 💐 #MothersDay #CelebriDay",
    },
  },
  {
    rule: { kind: "lastWeekday", month: 5, weekday: 1 },
    holiday: {
      name: "Memorial Day",
      description: "A federal holiday honoring the men and women who died while serving in the United States military.",
      funFact: "At 3 PM local time on Memorial Day, Americans are asked to pause for a National Moment of Remembrance.",
      emoji: "🎖️",
      category: "cultural",
      shareText: "Remembering and honoring those who gave everything. #MemorialDay #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 6, weekday: 0, n: 3 },
    holiday: {
      name: "Fathers Day",
      description: "A day to celebrate dads and father figures for their guidance, humor, and support.",
      funFact: "Sonora Smart Dodd started Father's Day in 1910 to honor her father, a Civil War veteran who raised six children on his own.",
      emoji: "👔",
      category: "cultural",
      shareText: "Here's to the dads and father figures who show up every day. Happy Father's Day! 👔 #FathersDay #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 9, weekday: 1, n: 1 },
    holiday: {
      name: "Labor Day",
      description: "A federal holiday celebrating the contributions of American workers and the unofficial farewell to summer.",
      funFact: "Oregon was the first state to make Labor Day an official holiday in 1887, and it became a national holiday in 1894.",
      emoji: "🛠️",
      category: "cultural",
      shareText: "Celebrating every hard worker out there. Happy Labor Day! 🛠️ #LaborDay #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 9, weekday: 1, n: 1, offsetDays: 6 },
    holiday: {
      name: "National Grandparents Day",
      description: "A day to honor grandparents and the wisdom, stories, and love they share across generations.",
      funFact: "Grandparents Day has its own official flower, the forget me not, and its own official song, A Song for Grandma and Grandpa.",
      emoji: "👵",
      category: "cultural",
      shareText: "Sending love to the grandparents who make life sweeter. Happy Grandparents Day! 👵 #GrandparentsDay #CelebriDay",
    },
  },
  {
    rule: { kind: "nthWeekday", month: 11, weekday: 0, n: 1 },
    holiday: {
      name: "Daylight Saving Time Ends",
      description: "Clocks fall back one hour tonight, which means one glorious extra hour of sleep.",
      funFact: "Hawaii and most of Arizona skip daylight saving time entirely and never change their clocks.",
      emoji: "😴",
      category: "other",
      shareText: "Fall back and enjoy that extra hour of sleep! 😴 #FallBack #CelebriDay",
    },
  },
  {
    rule: THANKSGIVING,
    holiday: {
      name: "Thanksgiving",
      description: "A day to gather with family and friends, share a big meal, and give thanks for the good things in life.",
      funFact: "Abraham Lincoln made Thanksgiving a national holiday in 1863 after a 17 year letter writing campaign by Sarah Josepha Hale, the author of Mary Had a Little Lamb.",
      emoji: "🦃",
      category: "food",
      shareText: "Grateful for good food and even better company. Happy Thanksgiving! 🦃 #Thanksgiving #CelebriDay",
    },
  },
  {
    rule: { ...THANKSGIVING, offsetDays: 1 },
    holiday: {
      name: "Black Friday",
      description: "The day after Thanksgiving and the traditional kickoff to the holiday shopping season.",
      funFact: "The name Black Friday was popularized by Philadelphia police in the 1960s to describe the traffic chaos the day after Thanksgiving.",
      emoji: "🛍️",
      category: "fun",
      shareText: "Deals, doorbusters, and leftover pie. Happy Black Friday! 🛍️ #BlackFriday #CelebriDay",
    },
  },
  {
    rule: { ...THANKSGIVING, offsetDays: 5 },
    holiday: {
      name: "Giving Tuesday",
      description: "A global day of generosity encouraging people to give back through donations, volunteering, and acts of kindness.",
      funFact: "Giving Tuesday started in 2012 at the 92nd Street Y in New York and is now celebrated in more than 80 countries.",
      emoji: "💝",
      category: "awareness",
      shareText: "Giving back and paying it forward this Giving Tuesday. 💝 #GivingTuesday #CelebriDay",
    },
  },
];

export function getMovingHolidaysForDate(month: number, day: number, year: number): Holiday[] {
  return MOVING_HOLIDAYS.filter(({ rule }) => {
    const date = resolveRule(rule, year);
    return !!date && date.getMonth() + 1 === month && date.getDate() === day;
  }).map(({ holiday }) => holiday);
}
