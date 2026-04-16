# CelebriDay — Feature Spec

## Review Prompt

**Goal:** Ask users to leave a 5-star review after they've built a habit of opening the app to check the daily holiday — the natural positive moment for a daily utility app.

**Library:** `expo-store-review`

**Storage key:** `celebriday.reviewPrompt.v1` (AsyncStorage JSON)

```ts
{
  distinctDays: string[];      // YYYY-MM-DD, one per calendar day the app was opened
  promptTimestamps: number[];  // epoch ms of each prompt shown
  sharedHolidayIds: string[];  // "month-day-name" IDs of holidays the user has shared
}
```

**Trigger conditions (all must be true):**

1. User has opened the app on ≥ 5 distinct calendar days
2. At least one of today's holidays has been favorited or shared historically
3. ≥ 45 days since last prompt (or never prompted)
4. Fewer than 3 prompts shown in the last 365 days (Apple policy cap)
5. `StoreReview.isAvailableAsync()` and `StoreReview.hasAction()` both return `true`

**Primary trigger:** Called 2 seconds after `TodayScreen` mounts, so holiday content is visible first.

**Share trigger (secondary):** When the user taps Share on a holiday card, condition 1 (day count) is waived. Conditions 3–5 still apply. The shared holiday ID is recorded so it satisfies condition 2 on future visits.

**Implementation:** `src/hooks/useReviewPrompt.ts`
- `maybeRequestReview()` — primary trigger, checks all conditions
- `recordShare(holidayId)` — secondary trigger, records share and bypasses day count
- `resetForDev()` — clears state (used by the dev reset button in Settings)

**Integration points:**
- `TodayScreen.tsx` — calls `maybeRequestReview()` via `setTimeout` 2 s after mount; passes `onShare` to each `HolidayCard` that calls `recordShare`
- `SettingsScreen.tsx` — `__DEV__`-only "Reset Review Prompt State" button under a DEVELOPER section
