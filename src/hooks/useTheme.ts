import { useColorScheme } from "react-native";

export interface Theme {
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  tabBar: string;
  isDark: boolean;
}

const lightTheme: Theme = {
  background: "#FAFAFA",
  cardBackground: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
  tabBar: "#FFFFFF",
  isDark: false,
};

const darkTheme: Theme = {
  background: "#111827",
  cardBackground: "#1F2937",
  textPrimary: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textTertiary: "#9CA3AF",
  border: "#374151",
  tabBar: "#1F2937",
  isDark: true,
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}
