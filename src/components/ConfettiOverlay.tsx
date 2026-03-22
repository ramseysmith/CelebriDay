import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PIECES = [
  { emoji: "🎉", xFrac: 0.08, delay: 0 },
  { emoji: "✨", xFrac: 0.22, delay: 160 },
  { emoji: "🎊", xFrac: 0.42, delay: 60 },
  { emoji: "🎉", xFrac: 0.58, delay: 220 },
  { emoji: "✨", xFrac: 0.76, delay: 40 },
  { emoji: "🎊", xFrac: 0.90, delay: 110 },
];

function ConfettiPiece({
  emoji,
  xFrac,
  delay,
}: {
  emoji: string;
  xFrac: number;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 1100 }),
        withTiming(0, { duration: 600 })
      )
    );
    translateY.value = withDelay(
      delay,
      withTiming(-220, { duration: 2000 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text
      style={[styles.piece, { left: xFrac * SCREEN_WIDTH - 16 }, style]}
    >
      {emoji}
    </Animated.Text>
  );
}

interface Props {
  onDone: () => void;
}

export function ConfettiOverlay({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {PIECES.map((p, i) => (
        <ConfettiPiece key={i} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  piece: {
    position: "absolute",
    bottom: "28%",
    fontSize: 34,
  },
});
