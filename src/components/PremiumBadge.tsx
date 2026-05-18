import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Pressable, View, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { usePremium } from "../hooks/usePremium";

interface Props {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PremiumBadgeImpl({ onPress }: Props) {
  const { isPremium } = usePremium();
  const [badgeWidth, setBadgeWidth] = useState(0);

  const translateX = useSharedValue(40);
  const opacity = useSharedValue(0);
  const shimmerX = useSharedValue(0);

  const entryStarted = useRef(false);
  const shimmerStarted = useRef(false);

  useEffect(() => {
    if (isPremium || entryStarted.current) return;
    entryStarted.current = true;

    translateX.value = withDelay(
      200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.5)) })
    );
    opacity.value = withDelay(
      200,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
  }, [isPremium]);

  useEffect(() => {
    if (isPremium || badgeWidth <= 0 || shimmerStarted.current) return;
    shimmerStarted.current = true;

    const shimmerWidth = badgeWidth * 0.6;
    shimmerX.value = -shimmerWidth;
    shimmerX.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(badgeWidth, {
            duration: 2200,
            easing: Easing.inOut(Easing.quad),
          }),
          withDelay(
            1000,
            withTiming(-shimmerWidth, { duration: 0 })
          )
        ),
        -1,
        false
      )
    );
  }, [isPremium, badgeWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - badgeWidth) > 0.5) {
      setBadgeWidth(w);
    }
  };

  if (isPremium) return null;

  const shimmerWidth = badgeWidth * 0.6;

  return (
    <AnimatedPressable
      onPress={onPress}
      onLayout={onLayout}
      style={[styles.badge, animatedStyle]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={styles.label}>✨ Remove Ads</Text>
      {badgeWidth > 0 && (
        <View style={styles.shimmerClip} pointerEvents="none">
          <Animated.View
            style={[
              styles.shimmerOverlay,
              { width: shimmerWidth },
              shimmerStyle,
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      )}
    </AnimatedPressable>
  );
}

export const PremiumBadge = React.memo(PremiumBadgeImpl);

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FF6B35",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  shimmerClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderRadius: 999,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
});
