import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

/**
 * lib/firebaseAdmin.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-only Firebase Admin initialization.
 *
 * Can be authenticated via:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string from Firebase Console -> Service Accounts)
 * 2. Or individual env vars: FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 * 3. Or default Project ID for local emulation / Google Cloud ADC
 */

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(parsed),
      });
    } catch (e) {
      console.error('[firebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', e);
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ket007';

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback
  return initializeApp({
    projectId,
  });
}

export function getAdminMessaging(): Messaging {
  const app = getFirebaseAdminApp();
  return getMessaging(app);
}
