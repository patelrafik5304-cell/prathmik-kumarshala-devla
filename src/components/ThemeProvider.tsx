'use client';

import { useEffect } from 'react';

const defaultColor = '#1e3a8a';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch('/api/settings?doc=website').then((r) => r.json()).then((data) => {
      if (data?.primaryColor) {
        document.documentElement.style.setProperty('--primary', data.primaryColor);
      }
    });
  }, []);

  return <>{children}</>;
}
