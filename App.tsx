import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { TodayScreen } from "./src/screens/TodayScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
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
            tabBarInactiveTintColor: "#9CA3AF",
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
              borderTopColor: "#F3F4F6",
              borderTopWidth: 1,
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
    </GestureHandlerRootView>
  );
}
