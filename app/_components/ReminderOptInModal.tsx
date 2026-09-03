'use client';

import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessagingAsync, registerServiceWorker } from '@/lib/firebase';
import { useProfileContext } from '@/app/_components/ProfileProvider';
import {
  trackReminderModalOpen,
  trackReminderOptInGranted,
  trackReminderOptInDenied,
  trackReminderOptInDeclined,
} from '@/lib/analytics';

// ─── Constants ───────────────────────────────────────────────────────────────

const VAPID_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    trackReminderModalOpen(gameId);

    // Pre-register service worker in the background for fast token acquisition
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker().catch(() => {});
    }
  }, [gameId]);

  // ── "Remind Me" flow ────────────────────────────────────────────────────

  async function handleRemindMe() {
    setStatus('loading');
    setErrorMessage(null);

    // 1. Verify browser support
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('denied');
      setErrorMessage('Notifications are not supported in this browser.');
      trackReminderOptInDenied(gameId, 'notifications_unsupported');
      return;
    }

    // 2. Check or request browser notification permission
    let permission: NotificationPermission = Notification.permission;

    if (permission === 'denied') {
      setStatus('denied');
      setErrorMessage(
        'Notifications are blocked in your browser settings. Please allow notifications for Cricket007 in your browser settings to receive reminders.'
      );
      trackReminderOptInDenied(gameId, 'permission_blocked_in_browser');
      return;
    }

    if (permission !== 'granted') {
      try {
        permission = await Notification.requestPermission();
      } catch (e) {
        console.warn('Error requesting notification permission:', e);
        permission = 'denied';
      }
    }

    if (permission !== 'granted') {
      localStorage.setItem(getReminderPrefKey(gameId), 'false');
      setStatus('denied');
      setErrorMessage('Notification permission was not granted.');
      trackReminderOptInDenied(gameId, 'permission_not_granted');
      return;
    }

    // 3. Permission is GRANTED! Register Service Worker & Get FCM Token
    try {
      const swRegistration = await registerServiceWorker();
      const messaging = await getFirebaseMessagingAsync();

      if (messaging) {
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration || undefined,
        });

        if (token && userId) {
          // Save token to Supabase via backend endpoint
          await fetch('/api/save-fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, gameId, token }),
          }).catch((err) => console.warn('Failed to save FCM token to backend:', err));
        }
      }

      // Mark opt-in as enabled in localStorage and track
      localStorage.setItem(getReminderPrefKey(gameId), 'true');
      trackReminderOptInGranted(gameId);
      setStatus('done');

      // Auto-close after showing success state briefly
      setTimeout(onClose, 1800);
    } catch (err: any) {
      console.warn('[FCM] Token registration note:', err);

      // Even if token push sync failed over network, browser permission IS granted.
      // Persist preference so we don't nag the user again, and confirm activation.
      localStorage.setItem(getReminderPrefKey(gameId), 'true');
      trackReminderOptInGranted(gameId);
      setStatus('done');
      setTimeout(onClose, 1800);
    }
  }

  // ── "No Thanks" flow ────────────────────────────────────────────────────

  function handleNoThanks() {
    localStorage.setItem(getReminderPrefKey(gameId), 'false');
    trackReminderOptInDeclined(gameId);
    onClose();
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0"
      onClick={handleNoThanks}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
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

            {/* ── Error / Denied toast ── */}
            {status === 'denied' && (
              <div className="bg-error-container rounded-lg px-3 py-2 text-xs font-body-md text-on-error-container text-center">
                {errorMessage || 'Enable notifications in your browser settings to get reminders.'}
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
