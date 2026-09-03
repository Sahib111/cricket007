/**
 * firebase-messaging-sw.js
 * ─────────────────────────────────────────────────────────────────────────────
 * FCM Service Worker — handles background push notifications when the app tab
 * is closed or not in focus. Must be served from the root path
 * (/firebase-messaging-sw.js), which Next.js does automatically for files in
 * /public.
 *
 * Uses Firebase compat (v8-style) scripts because ES module imports are not
 * supported in service workers in all browsers.
 */

// Import Firebase scripts via CDN (compatible with service worker scope)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ─── Firebase config (must match lib/firebase.ts) ───────────────────────────
// Hard-coded here because service workers cannot access Next.js env vars.
firebase.initializeApp({
  apiKey:            'AIzaSyD2_pB9Hr0lfmDkVtwjn_DTbBfdF1WH7K8',
  authDomain:        'ket007.firebaseapp.com',
  projectId:         'ket007',
  storageBucket:     'ket007.firebasestorage.app',
  messagingSenderId: '843050836701',
  appId:             '1:843050836701:web:6f48ce6328ff973eaf7134',
  measurementId:     'G-C2Y114X1TT',
});

const messaging = firebase.messaging();

// ─── Background message handler ─────────────────────────────────────────────
// Fires when the app is in the background / tab is closed.
// Foreground messages are handled by the app itself via onMessage().
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message received:', payload);

  const { title, body, icon } = payload.notification ?? {};

  self.registration.showNotification(title ?? 'Cricket007', {
    body: body ?? 'You have a new update!',
    icon: icon ?? '/icon.png',
    badge: '/icon.png',
    data: payload.data ?? {},
    // Clicking the notification opens / focuses the app
    actions: [{ action: 'open', title: 'Open App' }],
  });
});

// ─── Notification click handler ─────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = '/games/wordle'; // Deep-link straight to the Wordle game

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
