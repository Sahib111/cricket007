/**
 * lib/firebase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase client SDK — singleton init, safe for Next.js SSR.
 * Messaging is browser-only; call getFirebaseMessaging() only in useEffect /
 * event handlers, never at module load time on the server.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

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
function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Returns the Firebase Messaging instance.
 * Must only be called in a browser context (not during SSR).
 * Returns null in environments that don't support FCM (e.g. Safari without
 * notification permission, or SSR).
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
