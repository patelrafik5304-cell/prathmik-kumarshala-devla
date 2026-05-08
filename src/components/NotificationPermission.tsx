'use client';

import { useState, useEffect, useCallback } from 'react';

export default function NotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    const p = Notification.permission;
    setStatus(p);
    if (p === 'default') {
      setShowPrompt(true);
    }
  }, []);

  const handleRequest = useCallback(async () => {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setStatus(p);
    setShowPrompt(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

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
          onClick={handleRequest}
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
