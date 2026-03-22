import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { SubscriptionService } from "../services/SubscriptionService";

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  loading: true,
  refresh: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    SubscriptionService.invalidateCache();
    const status = await SubscriptionService.checkPremiumStatus();
    setIsPremium(status);
  }, []);

  useEffect(() => {
    SubscriptionService.checkPremiumStatus()
      .then((status) => {
        setIsPremium(status);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return React.createElement(
    PremiumContext.Provider,
    { value: { isPremium, loading, refresh } },
    children
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
