import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../hooks/useFavorites";
import { useTheme } from "../hooks/useTheme";
import { HolidayCard } from "../components/HolidayCard";
import { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function FavoritesScreen() {
  const navigation = useNavigation<NavProp>();
  const { getFavoriteHolidays, isFavorite, toggleFavorite } = useFavorites();
  const theme = useTheme();

  const favoriteHolidays = getFavoriteHolidays();

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🤍</Text>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        No saved holidays yet
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Tap the heart on any holiday card to save it here for later.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.navBar, { backgroundColor: theme.tabBar, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
          Saved Holidays
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <FlatList
        contentContainerStyle={[
          styles.content,
          favoriteHolidays.length === 0 && styles.contentEmpty,
        ]}
        data={favoriteHolidays}
        keyExtractor={(item) => `${item.month}-${item.day}-${item.holiday.name}`}
        renderItem={({ item, index }) => (
          <View>
            <Text style={[styles.dateLabel, { color: theme.textTertiary }]}>
              {MONTH_NAMES[item.month - 1]} {item.day}
            </Text>
            <HolidayCard
              holiday={item.holiday}
              index={index}
              month={item.month}
              day={item.day}
              isFavorited={isFavorite(item.month, item.day, item.holiday.name)}
              onToggleFavorite={() =>
                toggleFavorite(item.month, item.day, item.holiday.name)
              }
            />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 32,
    alignItems: "flex-start",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  navSpacer: {
    width: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  contentEmpty: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
