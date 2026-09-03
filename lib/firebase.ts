/**
 * lib/firebase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase client SDK — singleton init, safe for Next.js SSR.
 * Messaging is browser-only; call getFirebaseMessaging() only in useEffect /
 * event handlers, never at module load time on the server.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Returns the (already-initialised or freshly-initialised) Firebase app. */
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Returns the Firebase Messaging instance safely.
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window)) return null;

  try {
    const app = getFirebaseApp();
    return getMessaging(app);
  } catch {
    return null;
  }
}

/**
 * Asynchronously checks for messaging support and returns Messaging instance.
 */
export async function getFirebaseMessagingAsync(): Promise<Messaging | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    const supported = await isSupported().catch(() => false);
    if (!supported) return null;
    const app = getFirebaseApp();
    return getMessaging(app);
  } catch (e) {
    console.warn('[FCM] Messaging not supported or init error:', e);
    return null;
  }
}

/**
 * Registers the FCM service worker and waits for it to become ready.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn('[FCM] Service worker registration error:', err);
    return null;
  }
}
