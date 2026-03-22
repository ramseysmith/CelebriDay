import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { AdService } from "../services/AdService";
import { usePremium } from "./usePremium";

const IOS_AD_UNIT_ID = "ca-app-pub-3940256099942544/4411468910";
const ANDROID_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
const adUnitId = Platform.OS === "ios" ? IOS_AD_UNIT_ID : ANDROID_AD_UNIT_ID;

// Module-level flag so it survives re-renders but not app restarts
const sessionShown = { value: false };

export function useSessionAd() {
  const { isPremium, loading: premiumLoading } = usePremium();
  const triggered = useRef(false);

  useEffect(() => {
    if (premiumLoading) return;
    if (isPremium) return;
    if (sessionShown.value) return;
    if (triggered.current) return;

    triggered.current = true;
    sessionShown.value = true;

    (async () => {
      // Request ATT on iOS before loading any ad, then wait the full 2s
      await Promise.all([
        Platform.OS === "ios"
          ? requestTrackingPermissionsAsync().catch(() => {})
          : Promise.resolve(),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);

      try {
        const ad = await AdService.loadInterstitial(adUnitId);
        AdService.showInterstitial(ad);
      } catch {
        // silently skip — never block the UI
      }
    })();
  }, [premiumLoading, isPremium]);
}
