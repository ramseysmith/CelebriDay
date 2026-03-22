import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "../hooks/useTheme";

function SkeletonCard() {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const shimmerColor = theme.isDark ? "#374151" : "#E5E7EB";

  return (
    <Animated.View
      style={[styles.card, { backgroundColor: shimmerColor, opacity }]}
    />
  );
}

export function SkeletonLoader() {
  const theme = useTheme();
  const shimmerColor = theme.isDark ? "#374151" : "#E5E7EB";
  const shimmerLight = theme.isDark ? "#4B5563" : "#F3F4F6";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.headerLine,
          { backgroundColor: shimmerColor, width: "55%" },
        ]}
      />
      <View
        style={[
          styles.headerLine,
          {
            backgroundColor: shimmerLight,
            width: "35%",
            marginTop: 8,
            marginBottom: 24,
          },
        ]}
      />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  headerLine: {
    height: 28,
    borderRadius: 8,
    marginBottom: 4,
  },
  card: {
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
});
