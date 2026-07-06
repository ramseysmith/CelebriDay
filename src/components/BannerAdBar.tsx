import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { usePremium } from "../hooks/usePremium";
import { useTheme } from "../hooks/useTheme";

const useTestAds = __DEV__ || process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

const IOS_BANNER_AD_UNIT_ID = useTestAds
  ? TestIds.BANNER
  : "ca-app-pub-8327362355420246/6185342383";
const ANDROID_BANNER_AD_UNIT_ID = TestIds.BANNER; // no real Android unit configured yet
const adUnitId =
  Platform.OS === "ios" ? IOS_BANNER_AD_UNIT_ID : ANDROID_BANNER_AD_UNIT_ID;

/** Persistent bottom banner shown on every tab, flush above the tab bar. */
export function BannerAdBar() {
  const { isPremium, loading } = usePremium();
  const theme = useTheme();

  if (loading || isPremium) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.tabBar }]}>
      <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
});
