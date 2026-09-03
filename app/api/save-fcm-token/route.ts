import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/save-fcm-token
 * Body: { userId: string, gameId: string, token: string }
 *
 * Upserts the FCM registration token into the `fcm_tokens` Supabase table,
 * keyed by (user_id, game_id). Old tokens are overwritten automatically —
 * FCM rotates tokens and we always want the latest one.
 *
 * Required Supabase table (run once in Supabase SQL editor):
 *
 *   create table if not exists public.fcm_tokens (
 *     user_id    text not null,
 *     game_id    text not null,
 *     token      text not null,
 *     updated_at timestamptz default now(),
 *     primary key (user_id, game_id)
 *   );
 */

// Use the service-role key server-side so RLS doesn't block the upsert.
// Falls back to the anon key if the service role key is not set (still works
// if you add an RLS policy: allow insert/update where user_id = request body value).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, gameId, token } = body as {
      userId?: string;
      gameId?: string;
      token?: string;
    };

    // Validate
    if (!userId || !gameId || !token) {
      return NextResponse.json(
        { error: 'userId, gameId, and token are required.' },
        { status: 400 },
      );
    }

    // Upsert — if the row already exists, update the token and timestamp
    const { error } = await supabase.from('fcm_tokens').upsert(
      {
        user_id: userId,
        game_id: gameId,
        token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,game_id' },
    );

    if (error) {
      console.error('[save-fcm-token] Supabase upsert error:', error);
      return NextResponse.json({ error: 'Failed to save token.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[save-fcm-token] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
