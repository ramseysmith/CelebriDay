import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  ViewToken,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { NotificationService } from "../services/NotificationService";
import { useTheme } from "../hooks/useTheme";

const { width: W } = Dimensions.get("window");

const SLIDES = [
  {
    id: "welcome",
    emoji: "🎉",
    accent: "#FFF0EB",
    accentDark: "#2D1810",
    title: "Welcome to CelebriDay",
    body: "Discover a new holiday for every single day of the year.",
  },
  {
    id: "celebrations",
    emoji: "📅",
    accent: "#EFF6FF",
    accentDark: "#0F1F3D",
    title: "365 Celebrations",
    body: "From National Pizza Day to World Kindness Day, there is always something to celebrate.",
  },
  {
    id: "favorites",
    emoji: "❤️",
    accent: "#FFF0F6",
    accentDark: "#2D0F1E",
    title: "Save What You Love",
    body: "Tap the heart on any holiday to save it. Available with CelebriDay Premium.",
  },
  {
    id: "notifications",
    emoji: "🔔",
    accent: "#F3F0FF",
    accentDark: "#1A1040",
    title: "Never Miss a Day",
    body: "Get a fun morning notification with today's holiday and a fact you did not know.",
  },
];

function PageDot({ active }: { active: boolean }) {
  const w = useSharedValue(active ? 24 : 8);
  const op = useSharedValue(active ? 1 : 0.3);

  React.useEffect(() => {
    w.value = withTiming(active ? 24 : 8, { duration: 260 });
    op.value = withTiming(active ? 1 : 0.3, { duration: 260 });
  }, [active]);

  const style = useAnimatedStyle(() => ({ width: w.value, opacity: op.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

function SlideItem({
  slide,
  isLast,
  onTurnOn,
  onSkip,
  notifLoading,
  notifSuccess,
  isDark,
}: {
  slide: (typeof SLIDES)[0];
  isLast: boolean;
  onTurnOn: () => void;
  onSkip: () => void;
  notifLoading: boolean;
  notifSuccess: boolean;
  isDark: boolean;
}) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const ty = useSharedValue(32);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    ty.value = withSpring(0, { damping: 15, stiffness: 90 });
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <View style={[styles.slide, { width: W }]}>
      <Animated.View style={[styles.slideInner, anim]}>
        <View
          style={[
            styles.emojiCircle,
            { backgroundColor: isDark ? slide.accentDark : slide.accent },
          ]}
        >
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {slide.title}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {slide.body}
        </Text>

        {isLast && (
          <View style={styles.notifCta}>
            {notifSuccess ? (
              <View style={styles.successRow}>
                <Text style={styles.successEmoji}>✅</Text>
                <Text style={[styles.successText, { color: theme.textPrimary }]}>
                  You are all set!
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={onTurnOn}
                  activeOpacity={0.85}
                  disabled={notifLoading}
                >
                  {notifLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Turn On Notifications
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={onSkip}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryBtnText, { color: theme.textTertiary }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);
  const listRef = useRef<FlatList>(null);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  );

  const goToNext = useCallback(() => {
    Haptics.selectionAsync();
    const next = activeIndex + 1;
    if (next < SLIDES.length) {
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }
  }, [activeIndex]);

  const handleTurnOn = useCallback(async () => {
    setNotifLoading(true);
    const granted = await NotificationService.requestPermissions();
    if (granted) {
      await NotificationService.scheduleDailyNotifications(8, 0);
      await AsyncStorage.multiSet([
        ["notificationsEnabled", "true"],
        ["notificationHour", "8"],
        ["notificationMinute", "0"],
      ]);
      setNotifLoading(false);
      setNotifSuccess(true);
      setTimeout(onComplete, 900);
    } else {
      setNotifLoading(false);
      onComplete();
    }
  }, [onComplete]);

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onComplete}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.skipText, { color: theme.textTertiary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
        initialNumToRender={1}
        windowSize={2}
        renderItem={({ item, index }) => (
          <SlideItem
            slide={item}
            isLast={index === SLIDES.length - 1}
            onTurnOn={handleTurnOn}
            onSkip={onComplete}
            notifLoading={notifLoading}
            notifSuccess={notifSuccess}
            isDark={theme.isDark}
          />
        )}
        style={styles.list}
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <PageDot key={i} active={i === activeIndex} />
          ))}
        </View>

        {!isLast && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={goToNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  slideInner: {
    alignItems: "center",
    width: "100%",
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 16,
    lineHeight: 36,
  },
  body: {
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
  },
  notifCta: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "500",
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  successEmoji: {
    fontSize: 36,
  },
  successText: {
    fontSize: 20,
    fontWeight: "700",
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
  },
  nextBtn: {
    position: "absolute",
    right: 24,
    backgroundColor: "#FF6B35",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
