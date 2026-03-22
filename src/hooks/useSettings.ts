import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationService } from "../services/NotificationService";

export interface Settings {
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
}

const DEFAULTS: Settings = {
  notificationsEnabled: false,
  notificationHour: 8,
  notificationMinute: 0,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const [enabled, hour, minute] = await Promise.all([
        AsyncStorage.getItem("notificationsEnabled"),
        AsyncStorage.getItem("notificationHour"),
        AsyncStorage.getItem("notificationMinute"),
      ]);

      setSettings({
        notificationsEnabled: enabled === "true",
        notificationHour: hour !== null ? parseInt(hour, 10) : 8,
        notificationMinute: minute !== null ? parseInt(minute, 10) : 0,
      });
      setIsLoaded(true);
    }

    loadSettings();
  }, []);

  const updateNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      setSettings((prev) => ({ ...prev, notificationsEnabled: enabled }));
      await AsyncStorage.setItem("notificationsEnabled", String(enabled));

      if (enabled) {
        const granted = await NotificationService.requestPermissions();
        if (granted) {
          await NotificationService.scheduleDailyNotifications(
            settings.notificationHour,
            settings.notificationMinute
          );
        } else {
          setSettings((prev) => ({ ...prev, notificationsEnabled: false }));
          await AsyncStorage.setItem("notificationsEnabled", "false");
        }
        return granted;
      } else {
        await NotificationService.cancelAllNotifications();
        return false;
      }
    },
    [settings.notificationHour, settings.notificationMinute]
  );

  const updateNotificationTime = useCallback(
    async (hour: number, minute: number) => {
      setSettings((prev) => ({
        ...prev,
        notificationHour: hour,
        notificationMinute: minute,
      }));
      await Promise.all([
        AsyncStorage.setItem("notificationHour", String(hour)),
        AsyncStorage.setItem("notificationMinute", String(minute)),
      ]);

      if (settings.notificationsEnabled) {
        await NotificationService.scheduleDailyNotifications(hour, minute);
      }
    },
    [settings.notificationsEnabled]
  );

  return {
    settings,
    isLoaded,
    updateNotificationsEnabled,
    updateNotificationTime,
  };
}
