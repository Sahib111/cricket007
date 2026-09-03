/**
 * functions/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Cloud Function — Daily Game Reminder
 *
 * Scheduled trigger: runs once per day at 12:30 UTC (= 6:00 PM IST).
 * Queries Supabase for all FCM tokens registered for 'wordle', checks if each
 * user has already played today, and sends a push notification to those who
 * haven't.
 *
 * Deploy:
 *   cd functions
 *   npm install
 *   firebase deploy --only functions
 *
 * Required env vars (set via `firebase functions:secrets:set` or .env):
 *   SUPABASE_URL          — your Supabase project URL
 *   SUPABASE_SERVICE_KEY  — Supabase service-role key (bypasses RLS)
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { getFirestore } = require('firebase-admin/firestore'); // not used — here for reference

initializeApp();

// ─── Supabase REST helpers ───────────────────────────────────────────────────

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

/** Runs a Supabase REST query. Returns parsed JSON rows or throws. */
async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey:        SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Deletes a stale / invalid FCM token row from Supabase. */
async function deleteStaleToken(userId, gameId) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/fcm_tokens?user_id=eq.${encodeURIComponent(userId)}&game_id=eq.${encodeURIComponent(gameId)}`,
    {
      method: 'DELETE',
      headers: {
        apikey:        SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    },
  );
}

// ─── Scheduled function ─────────────────────────────────────────────────────

exports.sendDailyWordleReminder = onSchedule(
  {
    // 6:00 PM IST = 12:30 UTC
    schedule: '30 12 * * *',
    timeZone: 'UTC',
    // Retry once on failure
    retryCount: 1,
  },
  async (_event) => {
    const messaging = getMessaging();

    // 1. Fetch all FCM tokens registered for 'wordle'
    const tokens = await supabaseGet('fcm_tokens?game_id=eq.wordle&select=user_id,token');

    if (!tokens || tokens.length === 0) {
      console.log('[reminder] No tokens found — nothing to send.');
      return;
    }

    // 2. Get today's date string (YYYY-MM-DD) in UTC
    const todayStr = new Date().toISOString().slice(0, 10); // e.g. "2026-09-03"
    const startOfDay = `${todayStr}T00:00:00.000Z`;

    // 3. Fetch user_ids that already played wordle today
    const played = await supabaseGet(
      `game_results?game=eq.wordle&created_at=gte.${startOfDay}&select=user_id`,
    );
    const playedSet = new Set((played ?? []).map((r) => r.user_id));

    // 4. Send a notification to each user who hasn't played yet
    const sendPromises = tokens
      .filter(({ user_id }) => !playedSet.has(user_id))
      .map(async ({ user_id, token }) => {
        const message = {
          notification: {
            title: '🏏 Cricket Wordle is ready!',
            body: "Today's puzzle is waiting — keep your streak alive!",
          },
          webpush: {
            notification: {
              icon: 'https://cricket007.online/icon.png',
              badge: 'https://cricket007.online/icon.png',
              requireInteraction: false,
            },
            fcmOptions: {
              link: 'https://cricket007.online/games/wordle',
            },
          },
          token,
        };

        try {
          const response = await messaging.send(message);
          console.log(`[reminder] Sent to ${user_id}:`, response);
        } catch (err) {
          const code = err?.errorInfo?.code ?? err?.code ?? '';
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            // Token is stale — clean it up so we don't waste sends
            console.warn(`[reminder] Stale token for ${user_id} — deleting.`);
            await deleteStaleToken(user_id, 'wordle');
          } else {
            console.error(`[reminder] Failed to send to ${user_id}:`, err);
          }
        }
      });

    await Promise.allSettled(sendPromises);
    console.log(`[reminder] Done. Processed ${tokens.length} tokens.`);
  },
);
