import mobileAds, {
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

export const AdService = {
  async initialize(): Promise<void> {
    try {
      await mobileAds().initialize();
    } catch (e) {
      console.warn("AdService: initialization failed", e);
    }
  },

  loadInterstitial(adUnitId: string): Promise<InterstitialAd> {
    return new Promise((resolve) => {
      const ad = InterstitialAd.createForAdRequest(adUnitId);

      const unsubLoad = ad.addAdEventListener(AdEventType.LOADED, () => {
        unsubLoad();
        unsubError();
        resolve(ad);
      });

      const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        unsubLoad();
        unsubError();
        console.warn("AdService: failed to load interstitial", error);
        resolve(ad); // resolve anyway — showInterstitial checks ad.loaded
      });

      ad.load();
    });
  },

  showInterstitial(ad: InterstitialAd): void {
    if (ad.loaded) {
      ad.show();
    }
  },
};
