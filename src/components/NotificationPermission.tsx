'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFcmToken, onForegroundMessage } from '@/lib/fcm';

export default function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      registerToken();
    } else if (Notification.permission === 'default') {
      setShowPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (Notification.permission !== 'granted') return;
    const unsub = onForegroundMessage((payload) => {
      const { title, body } = payload.data || {};
      if (title) {
        new Notification(title, { body: body || '', icon: '/logo.jpeg' });
      }
    });
    return unsub;
  }, []);

  const registerToken = useCallback(async () => {
    try {
      const token = await getFcmToken();
      if (token) {
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        setRegistered(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAllow = useCallback(async () => {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setShowPrompt(false);
    if (p === 'granted') {
      await registerToken();
    }
  }, [registerToken]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  if (registered) return null;
  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: '#1e3a8a',
      color: '#fff',
      padding: '16px 20px',
      borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      maxWidth: 340,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.5 }}>
        Allow notifications to receive exam results and updates?
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Not now
        </button>
        <button
          onClick={handleAllow}
          style={{
            background: '#fff',
            border: 'none',
            color: '#1e3a8a',
            padding: '6px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Allow
        </button>
      </div>
    </div>
  );
}
