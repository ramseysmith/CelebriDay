import mobileAds, {
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";
/**
 * AdMob test device IDs — devices listed here always receive test ads,
 * regardless of build environment.
 */
const TEST_DEVICE_IDS: string[] = [
  "ACE862E9-099A-4B0B-A553-7D075641C3CF",
];

export const AdService = {
  async initialize(): Promise<void> {
    try {
      await mobileAds().setRequestConfiguration({
        testDeviceIdentifiers: TEST_DEVICE_IDS,
      });
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

  showAndWaitForClose(ad: InterstitialAd): Promise<void> {
    return new Promise((resolve) => {
      if (!ad.loaded) {
        resolve();
        return;
      }
      const unsub = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsub();
        resolve();
      });
      ad.show();
    });
  },
};
