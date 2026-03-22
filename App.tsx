import "react-native-gesture-handler";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { TodayScreen } from "./src/screens/TodayScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { PaywallScreen } from "./src/screens/PaywallScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { DailyRevealScreen } from "./src/screens/DailyRevealScreen";
import { PremiumProvider } from "./src/hooks/usePremium";
import { FavoritesProvider } from "./src/hooks/useFavorites";
import { useAppInit } from "./src/hooks/useAppInit";
import { useTheme } from "./src/hooks/useTheme";
import AnimatedSplash from "./src/components/AnimatedSplash";
import { RootStackParamList } from "./src/types/navigation";

// Must be called at module level — prevents the native static splash from
// auto-hiding before our animated version is ready to take over.
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Module-level flag so the reveal only shows once per app session
let sessionRevealDone = false;

function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === "Today") {
            iconName = focused ? "star" : "star-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 4,
        },
        headerStyle: {
          backgroundColor: theme.tabBar,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          color: theme.textPrimary,
        },
      })}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: "CelebriDay" }}
        listeners={{ tabPress: () => { Haptics.selectionAsync(); } }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        listeners={{ tabPress: () => { Haptics.selectionAsync(); } }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        listeners={{ tabPress: () => { Haptics.selectionAsync(); } }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isReady, showOnboarding, completeOnboarding } = useAppInit();
  const [revealDone, setRevealDone] = useState(sessionRevealDone);
  const theme = useTheme();

  if (!isReady) return null;

  if (showOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <PremiumProvider>
      <FavoritesProvider>
        <NavigationContainer theme={theme.isDark ? DarkTheme : DefaultTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>

        {/* Reveal overlay inside PremiumProvider so usePremium() works.
            Home screen renders underneath for a seamless transition. */}
        {!revealDone && (
          <DailyRevealScreen
            onComplete={() => {
              sessionRevealDone = true;
              setRevealDone(true);
            }}
          />
        )}
      </FavoritesProvider>
    </PremiumProvider>
  );
}

export default function App() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Hide the native static splash immediately — our animated version
  // takes over seamlessly because both use #FF6B35 as background.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Signal appReady after a short tick so the animated splash can mount
  // first. Heavy init (RevenueCat, AdMob, AsyncStorage) happens inside
  // AppContent via useAppInit — the splash holds until isReady anyway.
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = useCallback(() => {
    setSplashFinished(true);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* App content renders underneath, invisible until splash exits */}
      <View style={[styles.appContainer, !splashFinished && styles.hidden]}>
        <AppContent />
      </View>

      {/* Animated splash sits on top and unmounts when done */}
      {!splashFinished && (
        <AnimatedSplash isReady={appReady} onFinish={handleSplashFinish} />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
});
