const useTestAds = process.env.EXPO_PUBLIC_USE_TEST_ADS === "true";

const IOS_ADMOB_APP_ID = useTestAds
  ? "ca-app-pub-3940256099942544~1458002511"
  : "ca-app-pub-8327362355420246~2628064386";

const ANDROID_ADMOB_APP_ID = useTestAds
  ? "ca-app-pub-3940256099942544~3347511713"
  : "ca-app-pub-3940256099942544~3347511713"; // update when Android ad unit is available

module.exports = {
  expo: {
    name: "CelebriDay",
    slug: "celebriday",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FF6B35",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ramseysmith.celebriday",
      buildNumber: "1",
      icon: "./assets/icon.png",
      infoPlist: {
        NSUserTrackingUsageDescription:
          "CelebriDay uses this to show you relevant ads. You can change this anytime in Settings.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: "com.ramseysmith.celebriday",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#FF6B35",
      },
      predictiveBackGestureEnabled: false,
      permissions: ["com.google.android.gms.permission.AD_ID"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-sharing",
      [
        "expo-tracking-transparency",
        {
          userTrackingPermission:
            "CelebriDay uses this to show you relevant ads. You can change this anytime in Settings.",
        },
      ],
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#FF6B35",
        },
      ],
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: ANDROID_ADMOB_APP_ID,
          iosAppId: IOS_ADMOB_APP_ID,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "2ab5debe-6b66-430a-9152-e8d3e74ca2a2",
      },
    },
  },
};
