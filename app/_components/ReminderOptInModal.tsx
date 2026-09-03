'use client';

import { useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { useProfileContext } from '@/app/_components/ProfileProvider';

// ─── Constants ───────────────────────────────────────────────────────────────

const VAPID_KEY =
  'BDBZqILk_veuQ9klypRtxXvX-HXvE_WKwlrYJJw8Bk5VME20AtxmDmFqjXJZCGymGAanrjQrv09QvrEW5f17Vuc';

export function getReminderPrefKey(gameId: string) {
  return `reminderPref_${gameId}`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ReminderOptInModalProps {
  gameId: string;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReminderOptInModal({ gameId, onClose }: ReminderOptInModalProps) {
  const { userId } = useProfileContext();
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied' | 'done'>('idle');

  // ── "Remind Me" flow ────────────────────────────────────────────────────

  async function handleRemindMe() {
    setStatus('loading');

    // 1. Request browser notification permission
    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = 'denied';
    }

    if (permission !== 'granted') {
      localStorage.setItem(getReminderPrefKey(gameId), 'false');
      setStatus('denied');
      return;
    }

    // 2. Get FCM registration token
    try {
      const messaging = getFirebaseMessaging();
      if (!messaging) throw new Error('Messaging unavailable');

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (!token) throw new Error('No token returned');

      // 3. Save token to backend
      await fetch('/api/save-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, gameId, token }),
      });

      // 4. Persist preference
      localStorage.setItem(getReminderPrefKey(gameId), 'true');
      setStatus('done');

      // Auto-close after showing success state briefly
      setTimeout(onClose, 1800);
    } catch (err) {
      console.error('[FCM] getToken failed:', err);
      localStorage.setItem(getReminderPrefKey(gameId), 'false');
      setStatus('denied');
    }
  }

  // ── "No Thanks" flow ────────────────────────────────────────────────────

  function handleNoThanks() {
    localStorage.setItem(getReminderPrefKey(gameId), 'false');
    onClose();
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0"
      onClick={handleNoThanks}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Daily game reminder opt-in"
      >
        {/* ── Icon ── */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              notifications
            </span>
          </div>
        </div>

        {/* ── Copy ── */}
        {status === 'done' ? (
          <div className="text-center">
            <span
              className="material-symbols-outlined text-4xl text-pitch-green mb-1 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              You&rsquo;re set!
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              We&rsquo;ll remind you at 9 AM every day.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Don&rsquo;t miss tomorrow&rsquo;s puzzle!
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant mt-1.5">
                Want a daily reminder to play today&rsquo;s Cricket Wordle?
                Keep your streak alive with one tap.
              </p>
            </div>

            {/* ── Denied toast ── */}
            {status === 'denied' && (
              <div className="bg-error-container rounded-lg px-3 py-2 text-xs font-body-md text-on-error-container text-center">
                Enable notifications in your browser settings to get reminders.
              </div>
            )}

            {/* ── Buttons ── */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleRemindMe}
                disabled={status === 'loading'}
                className="w-full py-3 rounded-xl bg-primary text-white font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <span
                      className="material-symbols-outlined text-base animate-spin"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      progress_activity
                    </span>
                    Enabling…
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      notifications_active
                    </span>
                    Remind Me
                  </>
                )}
              </button>

              <button
                onClick={handleNoThanks}
                disabled={status === 'loading'}
                className="w-full py-2.5 rounded-xl border border-outline-variant font-headline font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-40"
              >
                No Thanks
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
