import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { TodayScreen } from "./src/screens/TodayScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

function TabIcon({ label }: { label: string }) {
  const icons: Record<string, string> = {
    Today: "🎉",
    Calendar: "📅",
    Settings: "⚙️",
  };
  return <Text style={{ fontSize: 22 }}>{icons[label] ?? "•"}</Text>;
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => <TabIcon label={route.name} />,
          tabBarActiveTintColor: "#A855F7",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#F3F4F6",
            paddingBottom: 4,
          },
          headerStyle: {
            backgroundColor: "#FFFFFF",
            shadowColor: "transparent",
            elevation: 0,
          },
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
            color: "#111827",
          },
        })}
      >
        <Tab.Screen
          name="Today"
          component={TodayScreen}
          options={{ title: "CelebriDay" }}
        />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
