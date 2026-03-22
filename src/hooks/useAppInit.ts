import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/NotificationService";
import { AdService } from "../services/AdService";
import { SubscriptionService } from "../services/SubscriptionService";

const REVENUECAT_API_KEY = "PLACEHOLDER_REVENUECAT_API_KEY";

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
