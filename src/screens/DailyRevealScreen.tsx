import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { HolidayService } from "../services/HolidayService";

const { width: W, height: H } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#FFE66D", "#4ECDC4", "#A855F7", "#EC4899",
  "#22C55E", "#3B82F6", "#EF4444", "#F97316", "#FF6B35",
];

interface ConfettiPiece {
  id: number;
  color: string;
  size: number;
  isRect: boolean;
  tx: number;
  ty: number;
  rot: number;
}

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 22 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 7 + Math.random() * 9,
    isRect: Math.random() < 0.4,
    tx: (Math.random() - 0.5) * W * 1.5,
    ty: i < 16
      ? -(90 + Math.random() * H * 0.55)
      : 60 + Math.random() * 180,
    rot: Math.random() * 720 - 360,
  }));
}

function ConfettiPieceView({ piece, fired }: { piece: ConfettiPiece; fired: boolean }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!fired) return;
    opacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(380, withTiming(0, { duration: 380 }))
    );
    tx.value = withTiming(piece.tx, { duration: 820, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(piece.ty, { duration: 820, easing: Easing.out(Easing.cubic) });
    rot.value = withTiming(piece.rot, { duration: 820, easing: Easing.out(Easing.cubic) });
  }, [fired]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          backgroundColor: piece.color,
          ...(piece.isRect
            ? { width: piece.size * 2.2, height: piece.size * 0.65, borderRadius: piece.size * 0.3 }
            : { width: piece.size, height: piece.size, borderRadius: piece.size / 2 }),
        },
        style,
      ]}
    />
  );
}

interface Props {
  onComplete: () => void;
}

export function DailyRevealScreen({ onComplete }: Props) {
  const todayEntry = HolidayService.getTodaysHolidays();
  const count = todayEntry?.holidays.length ?? 0;
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const confetti = useMemo(() => generateConfetti(), []);
  const [fired, setFired] = useState(false);

  // Entrance animations
  const dateOpacity = useSharedValue(0);
  const dateY = useSharedValue(18);
  const emojiScale = useSharedValue(0.3);
  const emojiOpacity = useSharedValue(0);
  const countScale = useSharedValue(0.3);
  const countOpacity = useSharedValue(0);
  const subOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.88);
  const pulse = useSharedValue(1);

  useEffect(() => {
    dateOpacity.value = withDelay(150, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    dateY.value = withDelay(150, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
    emojiOpacity.value = withDelay(320, withTiming(1, { duration: 300 }));
    emojiScale.value = withDelay(320, withSpring(1, { damping: 9, stiffness: 85 }));
    countOpacity.value = withDelay(520, withTiming(1, { duration: 350 }));
    countScale.value = withDelay(520, withSpring(1, { damping: 11, stiffness: 95 }));
    subOpacity.value = withDelay(680, withTiming(1, { duration: 350 }));
    btnOpacity.value = withDelay(880, withTiming(1, { duration: 400 }));
    btnScale.value = withDelay(880, withSpring(1, { damping: 13, stiffness: 110 }));
  }, []);

  // Start pulse after button entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.07, { duration: 850, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.0, { duration: 850, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleTap = useCallback(() => {
    if (fired) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFired(true);

    // Always navigate to home immediately after a brief confetti moment
    setTimeout(() => onComplete(), 700);
  }, [fired]);

  const dateStyle = useAnimatedStyle(() => ({
    opacity: dateOpacity.value,
    transform: [{ translateY: dateY.value }],
  }));
  const emojiStyle = useAnimatedStyle(() => ({
    opacity: emojiOpacity.value,
    transform: [{ scale: emojiScale.value }],
  }));
  const countStyle = useAnimatedStyle(() => ({
    opacity: countOpacity.value,
    transform: [{ scale: countScale.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ scale: btnScale.value * pulse.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.confettiOrigin} pointerEvents="none">
        {confetti.map((p) => (
          <ConfettiPieceView key={p.id} piece={p} fired={fired} />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.Text style={[styles.dateText, dateStyle]}>
          {dateLabel}
        </Animated.Text>

        <Animated.Text style={[styles.emoji, emojiStyle]}>🎉</Animated.Text>

        <Animated.Text style={[styles.countText, countStyle]}>
          {count}
        </Animated.Text>

        <Animated.Text style={[styles.subText, subStyle]}>
          {count === 1 ? "celebration today" : "celebrations today"}
        </Animated.Text>

        <Pressable
          onPress={handleTap}
          style={styles.btnWrapper}
          disabled={fired}
        >
          <Animated.View
            style={[
              styles.tapBtn,
              btnStyle,
            ]}
          >
            <Text style={styles.tapBtnText}>Tap to Reveal ✨</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B1120",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  confettiOrigin: {
    position: "absolute",
    top: H * 0.5,
    left: W * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  dateText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 28,
    textAlign: "center",
  },
  emoji: {
    fontSize: 68,
    marginBottom: 12,
  },
  countText: {
    color: "#FF6B35",
    fontSize: 100,
    fontWeight: "800",
    lineHeight: 100,
    marginBottom: 10,
  },
  subText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 52,
    letterSpacing: 0.3,
  },
  btnWrapper: {
    borderRadius: 32,
  },
  tapBtn: {
    backgroundColor: "#FF6B35",
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 52,
    minWidth: 220,
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  tapBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
