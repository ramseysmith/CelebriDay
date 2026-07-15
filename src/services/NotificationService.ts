import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { HolidayService } from "./HolidayService";
import { Holiday } from "../types/holiday";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const TEASER_TEMPLATES: ((holiday: Holiday) => string)[] = [
  () => "Tap to see what today is all about. You will not regret it 🎉",
  () => "Today has a holiday most people totally miss. Tap to be in the know.",
  () => "Your daily dose of something worth celebrating is waiting inside.",
  () => "Did you know today is extra special? Open up to find out why.",
  () => "Something fun is happening today. Go see what the world is celebrating.",
  () => "One fun fact about today is hiding in the app. Go grab it.",
  () => "Most people will walk right past today without knowing. Not you.",
  (h) => `Today is ${h.name} and there is a fun story behind it. Tap to read it.`,
  () => "Your celebration report for today is ready inside.",
  () => "Open up. Today has something worth knowing about.",
];

function hasDash(s: string): boolean {
  return s.includes("-") || s.includes("–") || s.includes("—");
}

function buildNotificationBody(
  holiday: Holiday,
  month: number,
  day: number
): string {
  const baseIndex = (month + day) % TEASER_TEMPLATES.length;
  let body = TEASER_TEMPLATES[baseIndex](holiday);
  if (body.length > 90 || hasDash(body)) {
    body = TEASER_TEMPLATES[(baseIndex + 1) % TEASER_TEMPLATES.length](holiday);
  }
  return body;
}

export class NotificationService {
  static async initialize(): Promise<void> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-holiday", {
        name: "Daily Holiday",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      return true;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  }

  static async scheduleDailyNotifications(
    hour: number,
    minute: number
  ): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);

      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();

      const entry = HolidayService.getHolidaysForDate(month, day);
      if (!entry || entry.holidays.length === 0) continue;

      const holiday = entry.holidays[0];
      const title = `${holiday.emoji} ${holiday.name}!`;
      const body = buildNotificationBody(holiday, month, day);

      if (__DEV__ && i <= 7) {
        const idx = (month + day) % TEASER_TEMPLATES.length;
        console.log(
          `[Notif] ${month}/${day} idx=${idx} len=${body.length} title="${title}" body="${body}"`
        );
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { month, day },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1,
          day: targetDate.getDate(),
          hour,
          minute,
          second: 0,
          repeats: false,
        },
      });
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledCount(): Promise<number> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  }

  static async rescheduleIfNeeded(
    hour: number,
    minute: number
  ): Promise<void> {
    const count = await NotificationService.getScheduledCount();
    if (count < 14) {
      await NotificationService.scheduleDailyNotifications(hour, minute);
    }
  }
}
