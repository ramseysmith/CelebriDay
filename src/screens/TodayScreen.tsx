import React, { useState, useCallback } from "react";
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
import { Holiday } from "../types/holiday";
import { usePremium } from "../hooks/usePremium";
import { useFavorites } from "../hooks/useFavorites";
import { useSessionAd } from "../hooks/useSessionAd";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function TodayScreen() {
  const navigation = useNavigation<NavProp>();
  const { isPremium } = usePremium();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [premiumBannerDismissed, setPremiumBannerDismissed] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(true);

  useSessionAd();

  React.useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationsGranted(status === "granted");
    });
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
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>
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
              <Text style={styles.bannerDismissText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
        <Text style={styles.subtitle}>Today's Celebrations</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!showPremiumBanner) return null;
    return (
      <View style={styles.premiumBanner}>
        <View style={styles.premiumBannerContent}>
          <Text style={styles.premiumBannerText}>
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
          <Text style={styles.bannerDismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={styles.emptyText}>
        No celebrations found for today. Check back tomorrow!
      </Text>
    </View>
  );

  return (
    <FlatList
      key={refreshKey}
      style={styles.container}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  bannerContent: {
    flex: 1,
    marginRight: 8,
  },
  bannerText: {
    fontSize: 13,
    color: "#92400E",
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
    color: "#9CA3AF",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  dateLabel: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
  },
  premiumBanner: {
    backgroundColor: "#FFF7F4",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECDB0",
  },
  premiumBannerContent: {
    flex: 1,
    marginRight: 8,
  },
  premiumBannerText: {
    fontSize: 13,
    color: "#92400E",
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
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
