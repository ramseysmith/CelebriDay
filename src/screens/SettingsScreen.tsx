import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSettings } from "../hooks/useSettings";
import { usePremium } from "../hooks/usePremium";
import { SubscriptionService } from "../services/SubscriptionService";
import { HolidayService } from "../services/HolidayService";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute.toString().padStart(2, "0");
  const period = hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${period}`;
}

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = tomorrow.getMonth() + 1;
  const day = tomorrow.getDate();
  return HolidayService.getHolidaysForDate(month, day);
}

export function SettingsScreen() {
  const navigation = useNavigation<NavProp>();
  const { settings, isLoaded, updateNotificationsEnabled, updateNotificationTime } =
    useSettings();
  const { isPremium, refresh: refreshPremium } = usePremium();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const tomorrow = getTomorrow();
  const tomorrowHoliday = tomorrow?.holidays[0] ?? null;

  const timeDate = new Date();
  timeDate.setHours(settings.notificationHour, settings.notificationMinute, 0, 0);

  const handleToggle = async (value: boolean) => {
    const granted = await updateNotificationsEnabled(value);
    if (value && !granted) {
      Alert.alert(
        "Notifications Blocked",
        "To enable notifications, go to your device settings and allow notifications for CelebriDay.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleTimeChange = async (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (event.type === "dismissed") return;
    if (!date) return;

    const hour = date.getHours();
    const minute = date.getMinutes();
    await updateNotificationTime(hour, minute);
  };

  const handleTimeRowPress = () => {
    if (!isPremium) {
      navigation.navigate("Paywall");
      return;
    }
    if (Platform.OS === "android") {
      setShowTimePicker(true);
    }
  };

  const handleRestorePurchases = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const active = await SubscriptionService.restorePurchases();
      await refreshPremium();
      if (active) {
        Alert.alert(
          "Restored",
          "Your premium subscription has been restored.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Nothing to Restore",
          "No active subscription was found for your account.",
          [{ text: "OK" }]
        );
      }
    } catch {
      Alert.alert("Restore Failed", "Please try again later.", [
        { text: "OK" },
      ]);
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = () => {
    const url =
      Platform.OS === "ios"
        ? "itms-apps://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    Linking.openURL(url).catch(() => {});
  };

  if (!isLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Section */}
      <Text style={styles.sectionHeader}>PREMIUM</Text>
      <View style={styles.card}>
        {isPremium ? (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>✨ CelebriDay Premium</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.row}
              onPress={handleManageSubscription}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>Manage Subscription</Text>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("Paywall")}
            activeOpacity={0.7}
          >
            <View style={styles.premiumRowContent}>
              <Text style={styles.premiumRowTitle}>✨ Go Premium</Text>
              <Text style={styles.premiumRowSubtitle}>
                Remove ads, unlock favorites, and more
              </Text>
            </View>
            <Text style={styles.premiumChevron}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications Section */}
      <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
      <View style={styles.card}>
        {/* Toggle */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Daily Notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: "#E5E7EB", true: "#FF6B35" }}
            thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
          />
        </View>

        {/* Time Picker Row */}
        {settings.notificationsEnabled && (
          <>
            <View style={styles.separator} />
            {Platform.OS === "ios" ? (
              isPremium ? (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Notification Time</Text>
                  <DateTimePicker
                    value={timeDate}
                    mode="time"
                    display="compact"
                    onChange={handleTimeChange}
                    themeVariant="light"
                    accentColor="#FF6B35"
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => navigation.navigate("Paywall")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowLabel}>Notification Time</Text>
                  <View style={styles.lockedRow}>
                    <Text style={styles.rowValue}>8:00 AM</Text>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                </TouchableOpacity>
              )
            ) : (
              <>
                <TouchableOpacity
                  style={styles.row}
                  onPress={handleTimeRowPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowLabel}>Notification Time</Text>
                  {isPremium ? (
                    <Text style={styles.rowValue}>
                      {formatTime(
                        settings.notificationHour,
                        settings.notificationMinute
                      )}
                    </Text>
                  ) : (
                    <View style={styles.lockedRow}>
                      <Text style={styles.rowValue}>8:00 AM</Text>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {showTimePicker && isPremium && (
                  <DateTimePicker
                    value={timeDate}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Tomorrow's Preview */}
        {settings.notificationsEnabled && tomorrowHoliday && (
          <>
            <View style={styles.separator} />
            <View style={styles.previewContainer}>
              <Text style={styles.rowLabel}>Tomorrow's Notification</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>
                  {tomorrowHoliday.emoji} {tomorrowHoliday.name}
                </Text>
                <Text style={styles.previewFact} numberOfLines={2}>
                  {tomorrowHoliday.funFact}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* About Section */}
      <Text style={styles.sectionHeader}>ABOUT</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => Alert.alert("Thanks!", "Rate us coming soon.")}
          activeOpacity={0.7}
        >
          <Text style={styles.rowLabel}>Rate CelebriDay</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.row}
          onPress={handleRestorePurchases}
          activeOpacity={0.7}
        >
          <Text style={styles.rowLabel}>Restore Purchases</Text>
          {restoring ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <Text style={styles.rowChevron}>›</Text>
          )}
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => Alert.alert("Privacy Policy", "Coming soon.")}
          activeOpacity={0.7}
        >
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => Alert.alert("Terms of Service", "Coming soon.")}
          activeOpacity={0.7}
        >
          <Text style={styles.rowLabel}>Terms of Service</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLabel: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  rowChevron: {
    fontSize: 20,
    color: "#D1D5DB",
    marginLeft: 8,
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lockIcon: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 16,
  },
  previewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  previewCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  previewFact: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  activeBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
  },
  premiumRowContent: {
    flex: 1,
  },
  premiumRowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6B35",
    marginBottom: 2,
  },
  premiumRowSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  premiumChevron: {
    fontSize: 20,
    color: "#FF6B35",
    marginLeft: 8,
  },
});
