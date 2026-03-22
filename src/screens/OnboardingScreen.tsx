import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationService } from "../services/NotificationService";
import { useTheme } from "../hooks/useTheme";

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const theme = useTheme();
  const heroAnim = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(ctaAnim, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTurnOn = async () => {
    setLoading(true);
    const granted = await NotificationService.requestPermissions();
    if (granted) {
      await NotificationService.scheduleDailyNotifications(8, 0);
      await AsyncStorage.multiSet([
        ["notificationsEnabled", "true"],
        ["notificationHour", "8"],
        ["notificationMinute", "0"],
      ]);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else {
      setLoading(false);
      onComplete();
    }
  };

  const handleMaybeLater = () => {
    onComplete();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.heroSection}>
        <Animated.View
          style={{
            opacity: heroAnim,
            transform: [{ translateY: heroSlide }],
          }}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>
            CelebriDay
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Every day is worth celebrating.
          </Text>
          <Text style={[styles.description, { color: theme.textTertiary }]}>
            Get a fun notification every morning telling you what holiday it is.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.ctaSection, { opacity: ctaAnim }]}>
        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={[styles.successText, { color: theme.textPrimary }]}>
              You're all set!
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleTurnOn}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Turn On Notifications
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleMaybeLater}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.secondaryButtonText, { color: theme.textTertiary }]}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footnote, { color: theme.textTertiary }]}>
              You can always change this in Settings.
            </Text>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    flex: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 88,
    textAlign: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  ctaSection: {
    flex: 4,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footnote: {
    fontSize: 12,
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  successText: {
    fontSize: 22,
    fontWeight: "700",
  },
});
