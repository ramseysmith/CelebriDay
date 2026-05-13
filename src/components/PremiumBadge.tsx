import React, { useEffect } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { usePremium } from "../hooks/usePremium";

interface Props {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PremiumBadge({ onPress }: Props) {
  const { isPremium } = usePremium();

  const translateX = useSharedValue(80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isPremium) return;

    translateX.value = withDelay(
      600,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
      })
    );
    opacity.value = withDelay(
      600,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );

    scale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.04, {
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1.0, {
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      )
    );
  }, [isPremium]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  if (isPremium) return null;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.badge, animatedStyle]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={styles.label}>✨ Go Premium</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 8,
    right: 16,
    backgroundColor: "#FF6B35",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
