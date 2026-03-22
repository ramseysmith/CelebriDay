import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { HolidayService } from "./HolidayService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
      return false;
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
      const body = holiday.funFact;

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
