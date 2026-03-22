# CelebriDay 🎉

A React Native (Expo managed workflow) app that tells you what holiday it is every single day of the year. Wake up to a daily notification, explore 365 days of celebrations, and share the fun with friends.

---

## Features

- **Daily notifications** — get a morning alert with today's holiday and a fun fact
- **Animated holiday cards** — staggered fade-in cards with category color accents
- **Full-year calendar** — browse every month with color-coded category dots
- **Share** — native share sheet on every card
- **Dark mode** — automatic, follows system setting
- **Confetti** — brief emoji animation on major holidays (New Year's, Halloween, Christmas, and more)

### Premium (CelebriDay Premium via RevenueCat)
- Ad free experience
- Save favorite holidays (persisted in AsyncStorage)
- Custom notification time
- Widget (coming in v1.1)

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Expo SDK 55, React Native 0.83 |
| Navigation | React Navigation (bottom tabs + native stack) |
| Animations | React Native Reanimated 4 |
| Bottom sheet | @gorhom/bottom-sheet v5 |
| Notifications | expo-notifications |
| Storage | @react-native-async-storage/async-storage |
| Ads | react-native-google-mobile-ads (AdMob) |
| Subscriptions | react-native-purchases (RevenueCat) |
| Tracking | expo-tracking-transparency (ATT on iOS) |
| Haptics | expo-haptics |

---

## Project Structure

```
src/
├── components/
│   ├── CalendarDayCell.tsx     # Individual calendar day with category dot and today pulse
│   ├── CalendarGrid.tsx        # Monthly grid layout
│   ├── CategoryBadge.tsx       # Colored category pill
│   ├── ConfettiOverlay.tsx     # Emoji confetti animation for major holidays
│   ├── HolidayBottomSheet.tsx  # Day detail sheet (gorhom bottom sheet)
│   ├── HolidayCard.tsx         # Main holiday card with press scale animation
│   └── SkeletonLoader.tsx      # Shimmer skeleton shown during cold start
├── constants/
│   └── colors.ts               # Category color map
├── data/
│   └── holidays.json           # 365-day holiday dataset (2+ holidays per day)
├── hooks/
│   ├── useAppInit.ts           # App startup: RevenueCat, AdMob, notifications, onboarding
│   ├── useFavorites.ts         # AsyncStorage favorites (premium only)
│   ├── usePremium.ts           # PremiumProvider + usePremium() context hook
│   ├── useSessionAd.ts         # Cold-start interstitial (ATT + 2s delay, once per session)
│   ├── useSettings.ts          # Notification settings with AsyncStorage persistence
│   └── useTheme.ts             # Light and dark color tokens via useColorScheme
├── screens/
│   ├── CalendarScreen.tsx      # Month calendar with swipe navigation
│   ├── OnboardingScreen.tsx    # First-run notification permission request
│   ├── PaywallScreen.tsx       # Premium subscription paywall (modal)
│   ├── SettingsScreen.tsx      # Notification settings, premium status, about
│   └── TodayScreen.tsx         # Today's holidays with confetti and premium banner
├── services/
│   ├── AdService.ts            # AdMob interstitial wrapper
│   ├── HolidayService.ts       # Holiday data queries (by date, category, search)
│   ├── NotificationService.ts  # Notification scheduling and management
│   └── SubscriptionService.ts  # RevenueCat purchase, restore, and status cache
└── types/
    ├── holiday.ts              # Holiday, DayEntry, HolidayCategory types
    └── navigation.ts           # RootStackParamList for typed navigation
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo`)
- iOS Simulator or Android Emulator (or a physical device with Expo Go)

### Install

```bash
git clone https://github.com/ramseysmith/CelebriDay.git
cd CelebriDay
npm install
```

### Run

```bash
npm start        # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
```

---

## Configuration

### RevenueCat
Keys are set in `src/hooks/useAppInit.ts`:
```ts
const REVENUECAT_TEST_KEY = "your_test_key";
const REVENUECAT_IOS_KEY = "your_ios_production_key";
const REVENUECAT_ANDROID_KEY = "your_android_production_key";
```
Development builds use the test key automatically via `__DEV__`. Production builds pick the platform-specific key.

RevenueCat setup:
- Entitlement ID: `CelebriDay Premium`
- Default offering packages: `monthly`, `yearly`

### AdMob
Ad unit IDs are in `src/hooks/useSessionAd.ts`. Google test IDs are used during development. Swap to real IDs before submitting.

App IDs are configured in `app.json` under the `react-native-google-mobile-ads` plugin.

### Notifications
One notification is scheduled per day for the next 30 days using a `CALENDAR` trigger. Notifications reschedule automatically when the app opens if fewer than 14 remain queued.

---

## Ad Policy Notes

AdMob policy compliance:
- One interstitial per cold start session only
- Never shown on app resume from background
- Never shown to premium subscribers
- ATT permission requested on iOS before any ad loads
- Google test IDs used in all development builds

---

## Before Submitting

- [ ] Swap RevenueCat test key for production keys in `useAppInit.ts`
- [ ] Swap AdMob test IDs in `app.json` and `useSessionAd.ts` for real production IDs
- [ ] Update `bundleIdentifier` and `package` in `app.json` if changed
- [ ] Push `privacy-policy.html`, `terms-of-service.html`, and `support.html` to GitHub Pages
- [ ] Add Privacy Policy URL and Support URL in App Store Connect
- [ ] Run `eas build` to generate production builds
- [ ] Test on a real iOS device via TestFlight
- [ ] Test on a real Android device

---

## Legal

- [Privacy Policy](privacy-policy.html)
- [Terms of Service](terms-of-service.html)
- [Support](support.html)

Contact: smith.s.ramsey@gmail.com
