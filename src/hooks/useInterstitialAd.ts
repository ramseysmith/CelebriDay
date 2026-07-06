import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { InterstitialAd } from "react-native-google-mobile-ads";
import { AdService } from "../services/AdService";
import { usePremium } from "./usePremium";

const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

const IOS_AD_UNIT_ID = useTestAds
  ? "ca-app-pub-3940256099942544/4411468910"
  : "ca-app-pub-8327362355420246/4588714019";
const ANDROID_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
const adUnitId = Platform.OS === "ios" ? IOS_AD_UNIT_ID : ANDROID_AD_UNIT_ID;

// Module-level so state is shared across every screen that can trigger an
// interstitial and survives re-renders, but resets on app restart.
const sessionShown = { value: false };
let preloadedAd: InterstitialAd | null = null;
let preloadStarted = false;

function preloadInterstitial() {
  if (preloadStarted) return;
  preloadStarted = true;
  AdService.loadInterstitial(adUnitId).then((ad) => {
    preloadedAd = ad;
  });
}

/**
 * Requests ATT (iOS) and preloads an interstitial in the background so it's
 * ready to show instantly the first time the user tries to like or share a
 * holiday. Does not show anything itself.
 */
export function usePreloadInterstitialAd() {
  const { isPremium, loading: premiumLoading } = usePremium();
  const started = useRef(false);

  useEffect(() => {
    if (premiumLoading || isPremium || started.current) return;
    started.current = true;

    (async () => {
      if (Platform.OS === "ios") {
        await requestTrackingPermissionsAsync().catch(() => {});
      }
      preloadInterstitial();
    })();
  }, [premiumLoading, isPremium]);
}

/**
 * Returns a function that shows the interstitial ad, at most once per
 * session, and only for non-premium users. Call it from a like/share
 * attempt handler.
 */
export function useInterstitialTrigger() {
  const { isPremium, loading: premiumLoading } = usePremium();

  return useCallback(() => {
    if (premiumLoading || isPremium || sessionShown.value) return;
    sessionShown.value = true;

    if (preloadedAd?.loaded) {
      AdService.showInterstitial(preloadedAd);
    } else {
      AdService.loadInterstitial(adUnitId).then((ad) => {
        AdService.showInterstitial(ad);
      });
    }
  }, [isPremium, premiumLoading]);
}
