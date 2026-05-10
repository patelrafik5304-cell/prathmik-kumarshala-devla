const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;

async function registerSw() {
  if (typeof window === 'undefined') return null;
  if ('serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    } catch {
      return null;
    }
  }
  return null;
}

export async function getFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    const { getApp } = await import('./firebase');
    const app = await getApp();
    if (!app) return null;
    const { getMessaging, getToken } = await import('firebase/messaging');
    await registerSw();
    const messaging = getMessaging(app);
    return await getToken(messaging, { vapidKey });
  } catch {
    return null;
  }
}

export async function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};

  try {
    const { getApp } = await import('./firebase');
    const app = await getApp();
    if (!app) return () => {};
    const { getMessaging, onMessage } = await import('firebase/messaging');
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
}
