import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminMessaging } from '@/lib/firebaseAdmin';

/**
 * GET /api/cron/daily-reminder
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Daily Reminder Cron Handler.
 * Triggered automatically every day (e.g. at 9:00 AM IST / 03:30 UTC).
 *
 * 1. Queries Supabase `fcm_tokens` for all 'wordle' subscribers.
 * 2. Checks Supabase `game_results` to see who already played Wordle today.
 * 3. Sends push notification via Firebase Admin to those who haven't played.
 * 4. Auto-cleans expired / invalid tokens.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(request: Request) {
  try {
    // Optional security: Verify CRON_SECRET if configured (e.g., from Vercel or external cron)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all tokens registered for wordle
    const { data: tokens, error: tokenError } = await supabase
      .from('fcm_tokens')
      .select('user_id, token')
      .eq('game_id', 'wordle');

    if (tokenError) {
      console.error('[Cron] Failed to fetch tokens from Supabase:', tokenError);
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: 'No registered tokens found', sent: 0 });
    }

    // 2. Identify users who already played Wordle today
    const todayStr = new Date().toISOString().slice(0, 10);
    const startOfDay = `${todayStr}T00:00:00.000Z`;

    const { data: playedToday } = await supabase
      .from('game_results')
      .select('user_id')
      .eq('game', 'wordle')
      .gte('created_at', startOfDay);

    const playedUserIds = new Set((playedToday ?? []).map((r) => r.user_id));

    // 3. Send notifications to players who haven't played yet
    const messaging = getAdminMessaging();
    let sentCount = 0;
    let skippedCount = 0;
    let staleCount = 0;

    const sendPromises = tokens.map(async ({ user_id, token }) => {
      if (playedUserIds.has(user_id)) {
        skippedCount++;
        return;
      }

      const message = {
        notification: {
          title: '🏏 Cricket Wordle is ready!',
          body: "Today's puzzle is waiting — keep your streak alive!",
        },
        webpush: {
          notification: {
            icon: 'https://cricket007.online/icon.png',
            badge: 'https://cricket007.online/icon.png',
          },
          fcmOptions: {
            link: 'https://cricket007.online/games/wordle',
          },
        },
        token,
      };

      try {
        await messaging.send(message);
        sentCount++;
      } catch (err: unknown) {
        const error = err as { code?: string; errorInfo?: { code?: string } };
        const code = error?.errorInfo?.code ?? error?.code ?? '';

        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          // Token is dead/uninstalled — delete from DB
          staleCount++;
          await supabase
            .from('fcm_tokens')
            .delete()
            .eq('user_id', user_id)
            .eq('game_id', 'wordle');
        } else {
          console.error(`[Cron] Error sending push to user ${user_id}:`, err);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({
      success: true,
      totalSubscribers: tokens.length,
      sentCount,
      skippedCount,
      staleTokensCleaned: staleCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Cron] Unexpected error during reminder broadcast:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
