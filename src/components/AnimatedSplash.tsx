import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BRAND_ORANGE = '#FF6B35';
const CONFETTI_COLORS = [
  '#FFE66D', '#4ECDC4', '#A855F7', '#EC4899',
  '#22C55E', '#3B82F6', '#EF4444', '#F97316',
];

interface ConfettiPiece {
  id: number;
  color: string;
  size: number;
  isRectangle: boolean;
  targetX: number;
  targetY: number;
  rotation: number;
  delay: number;
}

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    isRectangle: Math.random() < 0.3,
    targetX: (Math.random() - 0.5) * 500,
    targetY: (Math.random() - 0.5) * 500,
    rotation: Math.random() * 360,
    delay: 300 + i * 35,
  }));
}

interface AnimatedSplashProps {
  onFinish: () => void;
  isReady: boolean;
}

function ConfettiDot({ piece }: { piece: ConfettiPiece }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(1, { duration: 50 }),
        withDelay(350, withTiming(0, { duration: 200 }))
      )
    );
    translateX.value = withDelay(
      piece.delay,
      withTiming(piece.targetX, {
        duration: 550,
        easing: Easing.out(Easing.cubic),
      })
    );
    translateY.value = withDelay(
      piece.delay,
      withTiming(piece.targetY, {
        duration: 550,
        easing: Easing.out(Easing.cubic),
      })
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation, {
        duration: 550,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          backgroundColor: piece.color,
          ...(piece.isRectangle
            ? {
                width: piece.size * 2,
                height: piece.size * 0.7,
                borderRadius: piece.size * 0.35,
              }
            : {
                width: piece.size,
                height: piece.size,
                borderRadius: piece.size / 2,
              }),
        },
        style,
      ]}
    />
  );
}

export default function AnimatedSplash({ onFinish, isReady }: AnimatedSplashProps) {
  const confetti = useMemo(() => generateConfetti(), []);

  // Phase 1: Icon entrance
  const iconScale = useSharedValue(0.5);
  const iconOpacity = useSharedValue(0);

  // Phase 3: Text reveal
  const nameOpacity = useSharedValue(0);
  const nameTranslateY = useSharedValue(20);
  const tagOpacity = useSharedValue(0);
  const tagTranslateY = useSharedValue(15);

  // Phase 4: Exit
  const exitOpacity = useSharedValue(1);
  const exitScale = useSharedValue(1);

  // Phase 1: Icon bounces in
  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 300 });
    iconScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 1,
    });
  }, []);

  // Phase 3: Text slides up
  useEffect(() => {
    nameOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    nameTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    tagOpacity.value = withDelay(
      700,
      withTiming(0.75, { duration: 350, easing: Easing.out(Easing.quad) })
    );
    tagTranslateY.value = withDelay(
      700,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) })
    );
  }, []);

  // Phase 4: Exit when ready
  useEffect(() => {
    if (!isReady) return;

    const minDisplayTime = 1800;
    const timer = setTimeout(() => {
      exitOpacity.value = withTiming(
        0,
        {
          duration: 400,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        }
      );
      exitScale.value = withTiming(1.08, {
        duration: 400,
        easing: Easing.in(Easing.quad),
      });
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [isReady]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const nameAnimStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameTranslateY.value }],
  }));

  const tagAnimStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: tagTranslateY.value }],
  }));

  const exitAnimStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
    transform: [{ scale: exitScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, exitAnimStyle]}>
      {/* Confetti pieces (behind icon) */}
      <View style={styles.confettiContainer}>
        {confetti.map((piece) => (
          <ConfettiDot key={piece.id} piece={piece} />
        ))}
      </View>

      {/* Calendar icon */}
      <Animated.View style={[styles.iconWrapper, iconAnimStyle]}>
        {/* Ring posts */}
        <View style={styles.ringLeft} />
        <View style={styles.ringRight} />
        {/* Calendar header */}
        <View style={styles.calendarHeader} />
        {/* Calendar body */}
        <View style={styles.calendarBody}>
          {/* Grid dots */}
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4].map((col) => (
              <View
                key={`r1c${col}`}
                style={[styles.gridDot, { left: 12 + col * 20, top: 8 }]}
              />
            ))}
            {[0, 1, 3, 4].map((col) => (
              <View
                key={`r2c${col}`}
                style={[styles.gridDot, { left: 12 + col * 20, top: 28 }]}
              />
            ))}
            {[0, 1, 3, 4].map((col) => (
              <View
                key={`r3c${col}`}
                style={[styles.gridDot, { left: 12 + col * 20, top: 48 }]}
              />
            ))}
          </View>
          {/* Star */}
          <View style={styles.starContainer}>
            <Svg width={44} height={44} viewBox="0 0 44 44">
              <Polygon
                points="22,4 27,16 40,16 30,24 33,36 22,29 11,36 14,24 4,16 17,16"
                fill={BRAND_ORANGE}
              />
            </Svg>
          </View>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, nameAnimStyle]}>
        CelebriDay
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, tagAnimStyle]}>
        Every day is worth celebrating
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  confettiContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: SCREEN_HEIGHT * 0.42,
    left: SCREEN_WIDTH * 0.5,
  },
  iconWrapper: {
    width: 140,
    height: 120,
    alignItems: 'center',
    marginBottom: 24,
  },
  ringLeft: {
    position: 'absolute',
    top: 0,
    left: 30,
    width: 12,
    height: 32,
    backgroundColor: '#E8612A',
    borderRadius: 6,
    zIndex: 2,
  },
  ringRight: {
    position: 'absolute',
    top: 0,
    right: 30,
    width: 12,
    height: 32,
    backgroundColor: '#E8612A',
    borderRadius: 6,
    zIndex: 2,
  },
  calendarHeader: {
    position: 'absolute',
    top: 14,
    width: 140,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1,
  },
  calendarBody: {
    position: 'absolute',
    top: 44,
    width: 140,
    height: 76,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 1,
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND_ORANGE,
    opacity: 0.15,
  },
  starContainer: {
    position: 'absolute',
    top: 14,
    left: 48,
    zIndex: 2,
  },
  appName: {
    color: 'white',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
  },
  tagline: {
    color: 'white',
    fontSize: 17,
    fontWeight: '400',
    marginTop: 8,
  },
});
