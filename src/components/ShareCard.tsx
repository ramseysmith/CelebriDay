import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const SHARE_CARD_RENDER_SIZE = 360;
export const SHARE_CARD_OUTPUT_SIZE = 1080;

interface Props {
  emoji: string;
  name: string;
}

export const ShareCard = forwardRef<View, Props>(({ emoji, name }, ref) => {
  return (
    <View ref={ref} collapsable={false} style={styles.wrapper}>
      <LinearGradient
        colors={["#FF8C00", "#FF6B35", "#FF4500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.name} numberOfLines={3} adjustsFontSizeToFit>
            {name}
          </Text>
        </View>
        <Text style={styles.wordmark}>CelebriDay</Text>
      </LinearGradient>
    </View>
  );
});

ShareCard.displayName = "ShareCard";

const styles = StyleSheet.create({
  wrapper: {
    width: SHARE_CARD_RENDER_SIZE,
    height: SHARE_CARD_RENDER_SIZE,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 96,
    lineHeight: 110,
    textAlign: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 34,
  },
  wordmark: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    opacity: 0.9,
    letterSpacing: 1.2,
  },
});
