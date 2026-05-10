import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';
import app from './firebase';

const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;

async function registerSw() {
  if (typeof window === 'undefined') return null;
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      return reg;
    } catch {
      return null;
    }
  }
  return null;
}

function getMessagingSafe(app: FirebaseApp | null) {
  if (!app) return null;
  return getMessaging(app);
}

export async function getFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    const messaging = getMessagingSafe(app);
    if (!messaging) return null;
    await registerSw();
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};

  try {
    const messaging = getMessagingSafe(app);
    if (!messaging) return () => {};
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
