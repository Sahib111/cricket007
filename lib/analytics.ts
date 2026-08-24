'use client';

import posthog from 'posthog-js';

/* ─── Event names ───────────────────────────────────────────────── */
export const ANALYTICS_EVENTS = {
    // ── Navigation ────────────────────────────────
    GENDER_TOGGLED: 'gender_toggled',
    MATCH_CARD_CLICKED: 'match_card_clicked',
    GAME_CARD_CLICKED: 'game_card_clicked',
    PREDICT_BANNER_CLICKED: 'predict_banner_clicked',
    NAV_LINK_CLICKED: 'nav_link_clicked',
    SCORECARD_VIEWED: 'scorecard_viewed',

    // ── Auth & Profile ────────────────────────────
    NAME_SUBMITTED: 'name_submitted',
    LOGIN_ATTEMPTED: 'login_attempted',
    SIGNUP_ATTEMPTED: 'signup_attempted',
    AUTH_SUCCESS: 'auth_success',
    AUTH_FAILED: 'auth_failed',
    PROFILE_VIEWED: 'profile_viewed',
    USER_IDENTIFIED: 'user_identified',

    // ── Predict ───────────────────────────────────
    PREDICT_MATCH_SELECTED: 'predict_match_selected',
    PREDICTION_SUBMITTED: 'prediction_submitted',
    PREDICTION_RESULT_VIEWED: 'prediction_result_viewed',

    // ── Cricket Wordle ────────────────────────────
    WORDLE_GAME_STARTED: 'wordle_game_started',
    WORDLE_GUESS_SUBMITTED: 'wordle_guess_submitted',
    WORDLE_GAME_WON: 'wordle_game_won',
    WORDLE_GAME_LOST: 'wordle_game_lost',
    WORDLE_HINT_VIEWED: 'wordle_hint_viewed',
    WORDLE_SHARED: 'wordle_shared',

    // ── Mini Auction ──────────────────────────────
    AUCTION_GAME_STARTED: 'auction_game_started',
    AUCTION_BID_PLACED: 'auction_bid_placed',
    AUCTION_PASS: 'auction_pass',
    AUCTION_PLAYER_WON: 'auction_player_won',
    AUCTION_PLAYER_LOST: 'auction_player_lost',
    AUCTION_GAME_COMPLETE: 'auction_game_complete',

    // ── Guess the Cricketer ───────────────────────
    GUESS_GAME_STARTED: 'guess_game_started',
    GUESS_HINT_REVEALED: 'guess_hint_revealed',
    GUESS_SUBMITTED: 'guess_submitted',
    GUESS_CORRECT: 'guess_correct',
    GUESS_INCORRECT: 'guess_incorrect',
    GUESS_GAME_OVER: 'guess_game_over',
    GUESS_NEXT_ROUND: 'guess_next_round',

    // ── Economy ───────────────────────────────────
    COINS_EARNED: 'coins_earned',
    COINS_SPENT: 'coins_spent',

    // ── Engagement ────────────────────────────────
    GAME_SUGGESTION_SUBMITTED: 'game_suggestion_submitted',
    SUGGEST_MODAL_OPENED: 'suggest_modal_opened',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/* ─── Track helper ──────────────────────────────────────────────── */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;

    try {
        posthog.capture(event, properties);
    } catch {
        // PostHog not initialized — silently ignore
    }
}

/* ─── Identify helper (call after auth) ─────────────────────────── */
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;

    try {
        posthog.identify(userId, traits);
    } catch {
        // PostHog not initialized
    }
}

/* ─── Reset (call on logout) ────────────────────────────────────── */
export function resetAnalytics() {
    if (typeof window === 'undefined') return;

    try {
        posthog.reset();
    } catch {
        // PostHog not initialized
    }
}
