import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SubscriptionService } from "../services/SubscriptionService";
import { usePremium } from "../hooks/usePremium";

type Plan = "monthly" | "annual";

const FEATURES = [
  {
    emoji: "🚫",
    title: "Ad free experience",
    subtitle: "Open the app without interruptions",
  },
  {
    emoji: "❤️",
    title: "Favorite holidays",
    subtitle: "Save the ones you love and never forget them",
  },
  {
    emoji: "⏰",
    title: "Custom notification time",
    subtitle: "Choose when your daily celebration arrives",
  },
  {
    emoji: "🎨",
    title: "Exclusive widgets",
    subtitle: "Coming soon! Today's holiday on your home screen",
  },
];

export function PaywallScreen() {
  const navigation = useNavigation();
  const { refresh } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleStartPremium = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const success =
        selectedPlan === "annual"
          ? await SubscriptionService.purchaseAnnual()
          : await SubscriptionService.purchaseMonthly();
      if (success) {
        await refresh();
        navigation.goBack();
      }
    } catch {
      Alert.alert(
        "Purchase Failed",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const isPremium = await SubscriptionService.restorePurchases();
      await refresh();
      if (isPremium) {
        Alert.alert(
          "Restored",
          "Your premium subscription has been restored.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          "Nothing to Restore",
          "No active subscription was found for your account.",
          [{ text: "OK" }]
        );
      }
    } catch {
      Alert.alert("Restore Failed", "Please try again later.", [
        { text: "OK" },
      ]);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>CelebriDay Premium ✨</Text>
        <Text style={styles.subtitle}>
          Unlock the full celebration experience
        </Text>

        {/* Feature List */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingRow}>
          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              selectedPlan === "monthly" && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan("monthly")}
            activeOpacity={0.8}
          >
            <Text style={styles.pricingLabel}>Monthly</Text>
            <Text style={styles.pricingAmount}>$0.99</Text>
            <Text style={styles.pricingPer}>per month</Text>
          </TouchableOpacity>

          {/* Annual */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              styles.pricingCardAnnual,
              selectedPlan === "annual" && styles.pricingCardSelected,
            ]}
            onPress={() => setSelectedPlan("annual")}
            activeOpacity={0.8}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>Best Value</Text>
            </View>
            <Text style={styles.pricingLabel}>Annual</Text>
            <Text style={styles.pricingAmount}>$4.99</Text>
            <Text style={styles.pricingPer}>per year</Text>
            <Text style={styles.savingsText}>Save 58%</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
          onPress={handleStartPremium}
          activeOpacity={0.85}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>Start Premium</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.ctaDisclaimer}>
          Cancel anytime. No commitment.
        </Text>

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
            {restoring ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Text style={styles.footerLink}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerDot}>·</Text>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Terms of Service", "Coming soon.")
            }
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>

          <Text style={styles.footerDot}>·</Text>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Privacy Policy", "Coming soon.")
            }
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  featureList: {
    width: "100%",
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  featureEmoji: {
    fontSize: 24,
    width: 36,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  pricingRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  pricingCardAnnual: {
    transform: [{ scale: 1.02 }],
  },
  pricingCardSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF7F4",
  },
  bestValueBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pricingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pricingAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  pricingPer: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B35",
    marginTop: 4,
  },
  ctaButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ctaDisclaimer: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 10,
    marginBottom: 28,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  footerLink: {
    fontSize: 13,
    color: "#9CA3AF",
    textDecorationLine: "underline",
  },
  footerDot: {
    fontSize: 13,
    color: "#D1D5DB",
  },
});
