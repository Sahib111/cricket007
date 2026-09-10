'use client';

import posthog from 'posthog-js';

/* ─── Event Names Constants ─────────────────────────────────────── */
export const ANALYTICS_EVENTS = {
    // ── Navigation & Hubs ─────────────────────────
    NAV_LINK_CLICKED: 'nav_link_clicked',
    GAME_CARD_CLICKED: 'game_card_clicked',
    PREDICT_BANNER_CLICKED: 'predict_banner_clicked',
    GENDER_TOGGLED: 'gender_toggled',
    SCORECARD_VIEWED: 'scorecard_viewed',

    // ── Auth & Profile ────────────────────────────
    NAME_SUBMITTED: 'name_submitted',
    LOGIN_ATTEMPTED: 'login_attempted',
    SIGNUP_ATTEMPTED: 'signup_attempted',
    AUTH_SUCCESS: 'auth_success',
    AUTH_FAILED: 'auth_failed',
    PROFILE_VIEWED: 'profile_viewed',
    USER_IDENTIFIED: 'user_identified',

    // ── Daily Trivia ──────────────────────────────
    TRIVIA_CARD_CLICKED: 'trivia_card_clicked',
    TRIVIA_MODAL_CLOSED: 'trivia_modal_closed',

    // ── Push Notifications & Reminders ────────────
    REMINDER_MODAL_OPENED: 'reminder_modal_opened',
    REMINDER_OPT_IN_GRANTED: 'reminder_opt_in_granted',
    REMINDER_OPT_IN_DENIED: 'reminder_opt_in_denied',
    REMINDER_OPT_IN_DECLINED: 'reminder_opt_in_declined',

    // ── Predict & Win ─────────────────────────────
    PREDICT_MATCH_SELECTED: 'predict_match_selected',
    PREDICTION_SUBMITTED: 'prediction_submitted',
    PREDICTION_RESULT_VIEWED: 'prediction_result_viewed',

    // ── Cricket Wordle ────────────────────────────
    WORDLE_GAME_STARTED: 'wordle_game_started',
    WORDLE_GUESS_SUBMITTED: 'wordle_guess_submitted',
    WORDLE_GAME_WON: 'wordle_game_won',
    WORDLE_GAME_LOST: 'wordle_game_lost',
    WORDLE_HINT_VIEWED: 'wordle_hint_viewed',
    WORDLE_REPLAY: 'wordle_replay',
    WORDLE_SHARED: 'wordle_shared',

    // ── Mini Auction (Build Your Team) ────────────
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

    // ── Economy (Coins) ───────────────────────────
    COINS_EARNED: 'coins_earned',
    COINS_SPENT: 'coins_spent',

    // ── Suggestions & Feedback ────────────────────
    SUGGEST_MODAL_OPENED: 'suggest_modal_opened',
    GAME_SUGGESTION_SUBMITTED: 'game_suggestion_submitted',

    // ── Streak Analytics ──────────────────────────
    STREAK_UPDATED: 'streak_updated',
    STREAK_RECORD: 'streak_record',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/* ─── Global Base Properties Helper ─────────────────────────────── */
function getBaseProperties(): Record<string, unknown> {
    if (typeof window === 'undefined') return {};

    let localUserId: string | null = null;
    try {
        localUserId = localStorage.getItem('cricket007_user_id');
    } catch {
        // ignore localStorage read error
    }

    return {
        user_id: localUserId || undefined,
        timestamp: new Date().toISOString(),
        platform: 'web',
        page_path: window.location.pathname,
    };
}

/* ─── Base Track Helper ─────────────────────────────────────────── */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;

    try {
        const payload = {
            ...getBaseProperties(),
            ...properties,
        };
        posthog.capture(event, payload);
    } catch {
        // PostHog not initialized or blocked by client adblocker
    }
}

/* ─── Identify & Reset Helpers ──────────────────────────────────── */
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;

    try {
        posthog.identify(userId, {
            ...traits,
            last_active: new Date().toISOString(),
        });
    } catch {
        // PostHog not initialized
    }
}

export function resetAnalytics() {
    if (typeof window === 'undefined') return;

    try {
        posthog.reset();
    } catch {
        // PostHog not initialized
    }
}

/* ─── Streak Properties ─────────────────────────────────────────── */
export function setStreakProperties(currentStreak: number, maxStreak: number) {
    if (typeof window === 'undefined') return;

    try {
        posthog.setPersonProperties({
            current_streak: currentStreak,
            max_streak: maxStreak,
        });
    } catch {
        // PostHog not initialized
    }
}

export function trackStreakUpdated(data: {
    currentStreak: number;
    previousStreak: number;
    maxStreak: number;
    streakType?: string;
    gameName?: string;
    userId?: string;
}) {
    track(ANALYTICS_EVENTS.STREAK_UPDATED, {
        current_streak: data.currentStreak,
        previous_streak: data.previousStreak,
        max_streak: data.maxStreak,
        streak_type: data.streakType || 'daily_puzzle',
        game_name: data.gameName || 'wordle',
        user_id: data.userId,
    });
}

export function trackStreakRecord(data: {
    currentStreak: number;
    maxStreak: number;
    streakType?: string;
    gameName?: string;
}) {
    track(ANALYTICS_EVENTS.STREAK_RECORD, {
        current_streak: data.currentStreak,
        max_streak: data.maxStreak,
        streak_type: data.streakType || 'daily_puzzle',
        game_name: data.gameName || 'wordle',
    });
}

/* ─── Specialized Type-Safe Event Tracking Functions ───────────── */

// Navigation & Hubs
export function trackNavLinkClick(linkName: string, source: 'desktop_header' | 'mobile_drawer' | 'bottom_tab') {
    track(ANALYTICS_EVENTS.NAV_LINK_CLICKED, { link_name: linkName, source });
}

export function trackGameCardClick(game: 'wordle' | 'auction' | 'guess-cricketer' | string, source: 'home' | 'games_hub') {
    track(ANALYTICS_EVENTS.GAME_CARD_CLICKED, { game, source });
}

export function trackPredictBannerClick(source: 'home' | string) {
    track(ANALYTICS_EVENTS.PREDICT_BANNER_CLICKED, { source });
}

export function trackGenderToggle(gender: 'mens' | 'womens', source: string) {
    track(ANALYTICS_EVENTS.GENDER_TOGGLED, { gender, source });
}

export function trackScorecardView(matchId: string) {
    track(ANALYTICS_EVENTS.SCORECARD_VIEWED, { match_id: matchId });
}

// Daily Trivia
export function trackTriviaCardClick(factId: number | string, category: string, yearOrContext: string) {
    track(ANALYTICS_EVENTS.TRIVIA_CARD_CLICKED, {
        fact_id: factId,
        category,
        year_or_context: yearOrContext,
    });
}

export function trackTriviaModalClose(factId: number | string) {
    track(ANALYTICS_EVENTS.TRIVIA_MODAL_CLOSED, { fact_id: factId });
}

// Reminders & Push Notification Opt-in
export function trackReminderModalOpen(gameId: string) {
    track(ANALYTICS_EVENTS.REMINDER_MODAL_OPENED, { game_id: gameId });
}

export function trackReminderOptInGranted(gameId: string) {
    track(ANALYTICS_EVENTS.REMINDER_OPT_IN_GRANTED, { game_id: gameId, choice: 'remind_me', permission: 'granted' });
}

export function trackReminderOptInDenied(gameId: string, reason?: string) {
    track(ANALYTICS_EVENTS.REMINDER_OPT_IN_DENIED, { game_id: gameId, choice: 'remind_me', permission: 'denied', reason });
}

export function trackReminderOptInDeclined(gameId: string) {
    track(ANALYTICS_EVENTS.REMINDER_OPT_IN_DECLINED, { game_id: gameId, choice: 'no_thanks' });
}

// Cricket Wordle
export function trackWordleStart(mode: 'daily' | 'paid', wordLength: number) {
    track(ANALYTICS_EVENTS.WORDLE_GAME_STARTED, { game_id: 'wordle', mode, word_length: wordLength });
}

export function trackWordleGuess(guess: string, attemptNumber: number, mode: 'daily' | 'paid') {
    track(ANALYTICS_EVENTS.WORDLE_GUESS_SUBMITTED, {
        game_id: 'wordle',
        guess,
        attempt_number: attemptNumber,
        mode,
    });
}

export function trackWordleGameWon(
    attempts: number,
    mode: 'daily' | 'paid',
    targetWord: string,
    coinsWon: number,
    currentStreak?: number,
    maxStreak?: number,
) {
    track(ANALYTICS_EVENTS.WORDLE_GAME_WON, {
        game_id: 'wordle',
        attempts,
        mode,
        target_word: targetWord,
        coins_earned: coinsWon,
        current_streak: currentStreak,
        max_streak: maxStreak,
    });
}

export function trackWordleGameLost(
    attempts: number,
    mode: 'daily' | 'paid',
    targetWord: string,
    currentStreak?: number,
    maxStreak?: number,
) {
    track(ANALYTICS_EVENTS.WORDLE_GAME_LOST, {
        game_id: 'wordle',
        attempts,
        mode,
        target_word: targetWord,
        current_streak: currentStreak,
        max_streak: maxStreak,
    });
}

export function trackWordleReplay(cost: number) {
    track(ANALYTICS_EVENTS.WORDLE_REPLAY, { game_id: 'wordle', cost });
}

// Mini Auction (Build Your Team)
export function trackAuctionStart(lotCount: number, budget: number, teamSize: number) {
    track(ANALYTICS_EVENTS.AUCTION_GAME_STARTED, {
        game_id: 'auction',
        lot_count: lotCount,
        budget,
        team_size: teamSize,
    });
}

export function trackAuctionBidPlaced(playerName: string, bidAmount: number, walletRemaining: number) {
    track(ANALYTICS_EVENTS.AUCTION_BID_PLACED, {
        game_id: 'auction',
        player_name: playerName,
        bid_amount: bidAmount,
        wallet_remaining: walletRemaining,
    });
}

export function trackAuctionPass(playerName?: string, currentBid?: number, leadingBidder?: string | null) {
    track(ANALYTICS_EVENTS.AUCTION_PASS, {
        game_id: 'auction',
        player_name: playerName,
        current_bid: currentBid,
        leading_bidder: leadingBidder,
    });
}

export function trackAuctionPlayerWon(playerName: string, role: string, rating: number, price: number) {
    track(ANALYTICS_EVENTS.AUCTION_PLAYER_WON, {
        game_id: 'auction',
        player_name: playerName,
        player_role: role,
        player_rating: rating,
        price,
    });
}

export function trackAuctionPlayerLost(playerName: string, role: string, price: number) {
    track(ANALYTICS_EVENTS.AUCTION_PLAYER_LOST, {
        game_id: 'auction',
        player_name: playerName,
        player_role: role,
        price,
    });
}

export function trackAuctionComplete(data: {
    outcome: 'won' | 'lost' | 'draw';
    coinsEarned: number;
    yourTeamSize: number;
    computerTeamSize: number;
    yourRating: number;
    computerRating: number;
    budgetSpent: number;
}) {
    track(ANALYTICS_EVENTS.AUCTION_GAME_COMPLETE, {
        game_id: 'auction',
        outcome: data.outcome,
        coins_earned: data.coinsEarned,
        your_team_size: data.yourTeamSize,
        computer_team_size: data.computerTeamSize,
        your_rating: data.yourRating,
        computer_rating: data.computerRating,
        budget_spent: data.budgetSpent,
    });
}

// Guess the Cricketer
export function trackGuessStart(puzzleAnswer: string) {
    track(ANALYTICS_EVENTS.GUESS_GAME_STARTED, { game_id: 'guess-cricketer', puzzle_answer: puzzleAnswer });
}

export function trackGuessHintReveal(hintNumber: number, totalHints: number, remainingReward: number) {
    track(ANALYTICS_EVENTS.GUESS_HINT_REVEALED, {
        game_id: 'guess-cricketer',
        hint_number: hintNumber,
        total_hints: totalHints,
        remaining_reward: remainingReward,
    });
}

export function trackGuessSubmit(answer: string, isCorrect: boolean) {
    track(ANALYTICS_EVENTS.GUESS_SUBMITTED, {
        game_id: 'guess-cricketer',
        answer,
        is_correct: isCorrect,
    });
}

export function trackGuessCorrect(hintsUsed: number, coinsWon: number, puzzleAnswer: string) {
    track(ANALYTICS_EVENTS.GUESS_CORRECT, {
        game_id: 'guess-cricketer',
        hints_used: hintsUsed,
        coins_won: coinsWon,
        puzzle_answer: puzzleAnswer,
    });
}

export function trackGuessIncorrect(hintsUsed: number) {
    track(ANALYTICS_EVENTS.GUESS_INCORRECT, {
        game_id: 'guess-cricketer',
        hints_used: hintsUsed,
    });
}

export function trackGuessGameOver(puzzleAnswer: string, hintsUsed: number) {
    track(ANALYTICS_EVENTS.GUESS_GAME_OVER, {
        game_id: 'guess-cricketer',
        puzzle_answer: puzzleAnswer,
        hints_used: hintsUsed,
    });
}

export function trackGuessNextRound(roundNumber: number, totalCoinsSession: number, nextAnswer: string) {
    track(ANALYTICS_EVENTS.GUESS_NEXT_ROUND, {
        game_id: 'guess-cricketer',
        round_number: roundNumber,
        total_coins_session: totalCoinsSession,
        puzzle_answer: nextAnswer,
    });
}

// Predict & Win
export function trackPredictMatchSelect(matchId: string, matchName?: string, matchType?: string) {
    track(ANALYTICS_EVENTS.PREDICT_MATCH_SELECTED, {
        match_id: matchId,
        match_name: matchName,
        match_type: matchType,
    });
}

export function trackPredictionSubmit(matchId: string, matchName: string, predictedTeam: string, matchType?: string) {
    track(ANALYTICS_EVENTS.PREDICTION_SUBMITTED, {
        match_id: matchId,
        match_name: matchName,
        predicted_team: predictedTeam,
        match_type: matchType,
    });
}

// Coins Economy
export function trackCoinsEarned(amount: number, source: string) {
    track(ANALYTICS_EVENTS.COINS_EARNED, { amount, source });
}

export function trackCoinsSpent(amount: number, source: string) {
    track(ANALYTICS_EVENTS.COINS_SPENT, { amount, source });
}

// Suggestions Modal
export function trackSuggestModalOpen() {
    track(ANALYTICS_EVENTS.SUGGEST_MODAL_OPENED);
}

export function trackGameSuggestionSubmit(suggestionLength: number) {
    track(ANALYTICS_EVENTS.GAME_SUGGESTION_SUBMITTED, { suggestion_length: suggestionLength });
}

// Profile & Auth
export function trackNameSubmit(displayName: string) {
    track(ANALYTICS_EVENTS.NAME_SUBMITTED, { display_name: displayName });
}

export function trackProfileView(displayName: string) {
    track(ANALYTICS_EVENTS.PROFILE_VIEWED, { display_name: displayName });
}

export function trackAuthAttempt(mode: 'login' | 'signup') {
    if (mode === 'signup') {
        track(ANALYTICS_EVENTS.SIGNUP_ATTEMPTED);
    } else {
        track(ANALYTICS_EVENTS.LOGIN_ATTEMPTED);
    }
}

export function trackAuthSuccess(mode: 'login' | 'signup') {
    track(ANALYTICS_EVENTS.AUTH_SUCCESS, { mode });
}

export function trackAuthFail(mode: 'login' | 'signup', error: string) {
    track(ANALYTICS_EVENTS.AUTH_FAILED, { mode, error });
}
