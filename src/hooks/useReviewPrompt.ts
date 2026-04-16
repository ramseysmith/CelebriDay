import { useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const STORAGE_KEY = "celebriday.reviewPrompt.v1";
const MIN_DISTINCT_DAYS = 5;
const MS_45_DAYS = 45 * 24 * 60 * 60 * 1000;
const MS_365_DAYS = 365 * 24 * 60 * 60 * 1000;
const MAX_PROMPTS_PER_YEAR = 3;

interface ReviewPromptState {
  distinctDays: string[];
  promptTimestamps: number[];
  sharedHolidayIds: string[];
}

function todayString(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

async function loadState(): Promise<ReviewPromptState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ReviewPromptState;
  } catch {}
  return { distinctDays: [], promptTimestamps: [], sharedHolidayIds: [] };
}

async function saveState(state: ReviewPromptState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function attemptReview(
  state: ReviewPromptState,
  favorites: string[],
  todayHolidayIds: string[],
  bypassDayCount: boolean
): Promise<ReviewPromptState | null> {
  const now = Date.now();

  if (!bypassDayCount && state.distinctDays.length < MIN_DISTINCT_DAYS) {
    return null;
  }

  const engagedIds = new Set([...favorites, ...state.sharedHolidayIds]);
  if (!todayHolidayIds.some((id) => engagedIds.has(id))) {
    return null;
  }

  const yearlyPrompts = state.promptTimestamps.filter((t) => now - t < MS_365_DAYS);
  if (yearlyPrompts.length >= MAX_PROMPTS_PER_YEAR) return null;

  const lastPrompt = yearlyPrompts.length > 0 ? Math.max(...yearlyPrompts) : 0;
  if (lastPrompt > 0 && now - lastPrompt < MS_45_DAYS) return null;

  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) return null;
    const hasAction = await StoreReview.hasAction();
    if (!hasAction) return null;
  } catch {
    return null;
  }

  try {
    await StoreReview.requestReview();
  } catch (e) {
    console.log("[ReviewPrompt] requestReview failed:", e);
  }

  return { ...state, promptTimestamps: [...yearlyPrompts, now] };
}

export function useReviewPrompt(favorites: string[], todayHolidayIds: string[]) {
  useEffect(() => {
    async function trackOpen() {
      const state = await loadState();
      const today = todayString();
      if (!state.distinctDays.includes(today)) {
        await saveState({ ...state, distinctDays: [...state.distinctDays, today] });
      }
    }
    trackOpen();
  }, []);

  const maybeRequestReview = useCallback(async () => {
    const state = await loadState();
    const updated = await attemptReview(state, favorites, todayHolidayIds, false);
    if (updated) await saveState(updated);
  }, [favorites, todayHolidayIds]);

  const recordShare = useCallback(
    async (holidayId: string) => {
      const state = await loadState();
      const nextState = state.sharedHolidayIds.includes(holidayId)
        ? state
        : { ...state, sharedHolidayIds: [...state.sharedHolidayIds, holidayId] };
      const updated = await attemptReview(nextState, favorites, todayHolidayIds, true);
      await saveState(updated ?? nextState);
    },
    [favorites, todayHolidayIds]
  );

  const resetForDev = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { maybeRequestReview, recordShare, resetForDev };
}
