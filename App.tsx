import "react-native-gesture-handler";
import React from "react";
import { View } from "react-native";
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
import { PremiumProvider } from "./src/hooks/usePremium";
import { useAppInit } from "./src/hooks/useAppInit";
import { useTheme } from "./src/hooks/useTheme";
import { SkeletonLoader } from "./src/components/SkeletonLoader";
import { RootStackParamList } from "./src/types/navigation";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

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
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isReady, showOnboarding, completeOnboarding } = useAppInit();
  const theme = useTheme();

  if (!isReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SkeletonLoader />
      </GestureHandlerRootView>
    );
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <OnboardingScreen onComplete={completeOnboarding} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PremiumProvider>
        <NavigationContainer theme={theme.isDark ? DarkTheme : DefaultTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: "modal" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PremiumProvider>
    </GestureHandlerRootView>
  );
}
