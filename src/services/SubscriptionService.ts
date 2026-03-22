import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";

let cachedIsPremium: boolean | null = null;

export const SubscriptionService = {
  initialize(apiKey: string): void {
    try {
      Purchases.configure({ apiKey });
    } catch (e) {
      console.warn("SubscriptionService: initialization failed", e);
    }
  },

  async checkPremiumStatus(): Promise<boolean> {
    if (cachedIsPremium !== null) return cachedIsPremium;
    try {
      const info: CustomerInfo = await Purchases.getCustomerInfo();
      const active = info.entitlements.active["CelebriDay Premium"] !== undefined;
      cachedIsPremium = active;
      return active;
    } catch {
      cachedIsPremium = false;
      return false;
    }
  },

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch {
      return null;
    }
  },

  async purchaseMonthly(): Promise<boolean> {
    try {
      const offering = await SubscriptionService.getOfferings();
      const pkg = offering?.monthly;
      if (!pkg) return false;
      await Purchases.purchasePackage(pkg);
      cachedIsPremium = true;
      return true;
    } catch (e: any) {
      if (e.userCancelled) return false;
      throw e;
    }
  },

  async purchaseAnnual(): Promise<boolean> {
    try {
      const offering = await SubscriptionService.getOfferings();
      const pkg = offering?.yearly;
      if (!pkg) return false;
      await Purchases.purchasePackage(pkg);
      cachedIsPremium = true;
      return true;
    } catch (e: any) {
      if (e.userCancelled) return false;
      throw e;
    }
  },

  async restorePurchases(): Promise<boolean> {
    try {
      const info: CustomerInfo = await Purchases.restorePurchases();
      const active = info.entitlements.active["CelebriDay Premium"] !== undefined;
      cachedIsPremium = active;
      return active;
    } catch {
      return false;
    }
  },

  invalidateCache(): void {
    cachedIsPremium = null;
  },
};
