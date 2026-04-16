import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HolidayService } from "../services/HolidayService";
import { HolidayCard } from "../components/HolidayCard";
import { ConfettiOverlay } from "../components/ConfettiOverlay";
import { Holiday } from "../types/holiday";
import { usePremium } from "../hooks/usePremium";
import { useFavorites } from "../hooks/useFavorites";
import { useTheme } from "../hooks/useTheme";
import { useReviewPrompt } from "../hooks/useReviewPrompt";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MAJOR_HOLIDAYS: { month: number; day: number }[] = [
  { month: 1, day: 1 },   // New Year's Day
  { month: 2, day: 14 },  // Valentine's Day
  { month: 3, day: 17 },  // St. Patrick's Day
  { month: 7, day: 4 },   // Independence Day
  { month: 10, day: 31 }, // Halloween
  { month: 12, day: 24 }, // Christmas Eve
  { month: 12, day: 25 }, // Christmas
  { month: 12, day: 31 }, // New Year's Eve
];

const confettiShownThisSession = { value: false };

export function TodayScreen() {
  const navigation = useNavigation<NavProp>();
  const { isPremium } = usePremium();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [premiumBannerDismissed, setPremiumBannerDismissed] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  React.useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationsGranted(status === "granted");
    });

    // Check for major holiday confetti
    if (!confettiShownThisSession.value) {
      const today = new Date();
      const isMajor = MAJOR_HOLIDAYS.some(
        (h) =>
          h.month === today.getMonth() + 1 && h.day === today.getDate()
      );
      if (isMajor) {
        confettiShownThisSession.value = true;
        setShowConfetti(true);
      }
    }
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayEntry = HolidayService.getTodaysHolidays();
  const holidays: Holiday[] = todayEntry?.holidays ?? [];
  const todayMonth = todayEntry?.month ?? today.getMonth() + 1;
  const todayDay = todayEntry?.day ?? today.getDate();

  const todayHolidayIds = holidays.map((h) => `${todayMonth}-${todayDay}-${h.name}`);
  const { maybeRequestReview, recordShare } = useReviewPrompt(favorites, todayHolidayIds);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      maybeRequestReview();
    }, 2000);
    return () => clearTimeout(timer);
  }, [maybeRequestReview]);

  const onRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 600);
  }, []);

  const showNotifBanner = !notificationsGranted && !bannerDismissed;
  const showPremiumBanner = !isPremium && !premiumBannerDismissed;

  const renderHeader = () => (
    <View>
      {showNotifBanner && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.isDark ? "#1F2937" : "#FFF7ED",
              borderColor: theme.isDark ? "#374151" : "#FED7AA",
            },
          ]}
        >
          <View style={styles.bannerContent}>
            <Text
              style={[
                styles.bannerText,
                { color: theme.isDark ? "#FCD34D" : "#92400E" },
              ]}
            >
              Never miss a celebration! Enable notifications to get daily
              holiday alerts.
            </Text>
          </View>
          <View style={styles.bannerActions}>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => {
                Notifications.requestPermissionsAsync().then(({ status }) => {
                  if (status === "granted") {
                    setNotificationsGranted(true);
                  }
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.bannerButtonText}>Turn On</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bannerDismiss}
              onPress={() => setBannerDismissed(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.bannerDismissText, { color: theme.textTertiary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.header}>
        <Text style={[styles.dateLabel, { color: theme.textPrimary }]}>
          {dateLabel}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Today's Celebrations
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!showPremiumBanner) return null;
    return (
      <View
        style={[
          styles.premiumBanner,
          {
            backgroundColor: theme.isDark ? "#1F2937" : "#FFF7F4",
            borderColor: theme.isDark ? "#374151" : "#FECDB0",
          },
        ]}
      >
        <View style={styles.premiumBannerContent}>
          <Text
            style={[
              styles.premiumBannerText,
              { color: theme.isDark ? "#D1D5DB" : "#92400E" },
            ]}
          >
            Remove ads and unlock favorites with CelebriDay Premium
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Paywall")}
            activeOpacity={0.7}
          >
            <Text style={styles.premiumBannerLink}>Learn More</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.bannerDismiss}
          onPress={() => setPremiumBannerDismissed(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.bannerDismissText, { color: theme.textTertiary }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No celebrations found for today. Check back tomorrow!
      </Text>
    </View>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <FlatList
        key={refreshKey}
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        data={holidays}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={({ item, index }) => (
          <HolidayCard
            holiday={item}
            index={index}
            month={todayMonth}
            day={todayDay}
            isFavorited={isFavorite(todayMonth, todayDay, item.name)}
            onToggleFavorite={() =>
              toggleFavorite(todayMonth, todayDay, item.name)
            }
            onOpenPaywall={() => navigation.navigate("Paywall")}
            onShare={() => recordShare(`${todayMonth}-${todayDay}-${item.name}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
            colors={["#FF6B35"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      {showConfetti && (
        <ConfettiOverlay onDone={() => setShowConfetti(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  banner: {
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  bannerContent: {
    flex: 1,
    marginRight: 8,
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bannerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bannerDismiss: {
    padding: 4,
  },
  bannerDismissText: {
    fontSize: 14,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  dateLabel: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  premiumBanner: {
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  premiumBannerContent: {
    flex: 1,
    marginRight: 8,
  },
  premiumBannerText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  premiumBannerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B35",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
