import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
  Linking,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  LinearTransition,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Ionicons } from "@expo/vector-icons";
import { Holiday } from "../types/holiday";
import { CATEGORY_COLORS } from "../constants/colors";
import { CategoryBadge } from "./CategoryBadge";
import { usePremium } from "../hooks/usePremium";
import { useTheme } from "../hooks/useTheme";
import { ShareCard, SHARE_CARD_OUTPUT_SIZE } from "./ShareCard";
import { APP_LINKS } from "../constants/appLinks";

interface Props {
  holiday: Holiday;
  index: number;
  month?: number;
  day?: number;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onOpenPaywall?: () => void;
  onShare?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function HolidayCard({
  holiday,
  index,
  isFavorited = false,
  onToggleFavorite,
  onOpenPaywall,
  onShare,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const { isPremium } = usePremium();
  const theme = useTheme();
  const color = CATEGORY_COLORS[holiday.category];
  const shareCardRef = useRef<View>(null);
  const collapsible = !!onToggleCollapse;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const scale = useSharedValue(1);
  const chevronRotation = useSharedValue(collapsed ? 0 : 180);

  useEffect(() => {
    const delay = index * 120;
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450 }));
  }, []);

  useEffect(() => {
    chevronRotation.value = withTiming(collapsed ? 0 : 180, { duration: 200 });
  }, [collapsed]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const handleToggleCollapse = async () => {
    if (!onToggleCollapse) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleCollapse();
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const blurb = holiday.funFact || holiday.description;
    const message = `${holiday.emoji} Happy ${holiday.name}! 🎉\n\n${blurb}\n\nDiscover today's holidays with CelebriDay:\n${APP_LINKS.celebriday}`;
    try {
      let imageUri: string | null = null;
      if (shareCardRef.current) {
        try {
          imageUri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1,
            width: SHARE_CARD_OUTPUT_SIZE,
            height: SHARE_CARD_OUTPUT_SIZE,
            result: "tmpfile",
          });
        } catch {
          imageUri = null;
        }
      }

      if (imageUri && Platform.OS === "ios") {
        await Share.share({ url: imageUri, message });
      } else if (imageUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(imageUri, {
          mimeType: "image/png",
          dialogTitle: holiday.name,
          UTI: "public.png",
        });
      } else {
        await Share.share({ message });
      }
    } catch {
      // ignore cancelled share
    }
    onShare?.();
  };

  const handleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPremium) {
      onToggleFavorite?.();
    } else {
      onOpenPaywall?.();
    }
  };

  const handleAffiliate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (holiday.affiliateUrl) {
      Linking.openURL(holiday.affiliateUrl).catch(() => {});
    }
  };

  const showAffiliateButton =
    !!holiday.affiliateUrl &&
    holiday.affiliateUrl !== "#" &&
    holiday.affiliateUrl.length > 0;

  const renderChevron = () => {
    if (!collapsible) return null;
    return (
      <Animated.View style={chevronStyle}>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.textTertiary}
        />
      </Animated.View>
    );
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ borderRadius: 20 }}>
      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard ref={shareCardRef} emoji={holiday.emoji} name={holiday.name} />
      </View>
      <Animated.View
        layout={collapsible ? LinearTransition.duration(250) : undefined}
        style={[
          styles.card,
          {
            borderLeftColor: color,
            backgroundColor: theme.cardBackground,
            shadowColor: theme.isDark ? "#000" : "#000",
          },
          animatedStyle,
        ]}
      >
        {collapsible && collapsed ? (
          <Pressable
            onPress={handleToggleCollapse}
            style={styles.collapsedRow}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.collapsedEmoji}>{holiday.emoji}</Text>
            <Text
              style={[styles.collapsedName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {holiday.name}
            </Text>
            {renderChevron()}
          </Pressable>
        ) : (
          <>
            {collapsible && (
              <Pressable
                onPress={handleToggleCollapse}
                style={styles.chevronAbs}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {renderChevron()}
              </Pressable>
            )}
            <Text style={styles.emoji}>{holiday.emoji}</Text>
            <Text style={[styles.name, { color: theme.textPrimary }]}>
              {holiday.name}
            </Text>
            <CategoryBadge category={holiday.category} />
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {holiday.description}
            </Text>
            <Text style={[styles.funFact, { color: theme.textTertiary }]}>
              💡 {holiday.funFact}
            </Text>

            {showAffiliateButton && (
              <TouchableOpacity
                style={styles.affiliateBtn}
                onPress={handleAffiliate}
                activeOpacity={0.7}
              >
                <Text style={styles.affiliateBtnText}>
                  Celebrate This Holiday 🎁
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.actions, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={theme.textTertiary}
                />
                <Text style={[styles.actionLabel, { color: theme.textTertiary }]}>
                  Share
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleFavorite}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPremium && isFavorited ? "heart" : "heart-outline"}
                  size={20}
                  color={isPremium && isFavorited ? "#EF4444" : theme.textTertiary}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.textTertiary },
                    isPremium && isFavorited && styles.favoriteLabel,
                  ]}
                >
                  {isPremium && isFavorited ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  collapsedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  collapsedEmoji: {
    fontSize: 22,
  },
  collapsedName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  chevronAbs: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 10,
  },
  funFact: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  affiliateBtn: {
    borderWidth: 1.5,
    borderColor: "#FF6B35",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  affiliateBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  favoriteLabel: {
    color: "#EF4444",
  },
  offscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0,
    zIndex: -1,
  },
});
