import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/NotificationService";
import { AdService } from "../services/AdService";
import { SubscriptionService } from "../services/SubscriptionService";

const REVENUECAT_IOS_KEY = "appl_yAntjvqDdAwYWsYqDktDZpwBrHW";
const REVENUECAT_ANDROID_KEY = "PLACEHOLDER_ANDROID_REVENUECAT_KEY";

const REVENUECAT_API_KEY =
  Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

export function useAppInit() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    async function init() {
      SubscriptionService.initialize(REVENUECAT_API_KEY);
      await AdService.initialize();
      await NotificationService.initialize();

      const hasCompleted = await AsyncStorage.getItem("hasCompletedOnboarding");

      if (hasCompleted !== "true") {
        setShowOnboarding(true);
      } else {
        const [hourStr, minuteStr] = await Promise.all([
          AsyncStorage.getItem("notificationHour"),
          AsyncStorage.getItem("notificationMinute"),
        ]);
        const hour = hourStr !== null ? parseInt(hourStr, 10) : 8;
        const minute = minuteStr !== null ? parseInt(minuteStr, 10) : 0;
        await NotificationService.rescheduleIfNeeded(hour, minute);
      }

      listenerRef.current =
        Notifications.addNotificationResponseReceivedListener(() => {
          // Navigation to Today tab is handled by the tab navigator default behavior
        });

      const opens = parseInt((await AsyncStorage.getItem("appOpens")) ?? "0", 10) + 1;
      await AsyncStorage.setItem("appOpens", String(opens));

      setIsReady(true);
    }

    init();

    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
    setShowOnboarding(false);
  };

  return { isReady, showOnboarding, completeOnboarding };
}
