'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

export default function LoadingOverlay({ loading, message = 'Loading...' }: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-gray-600">{message}</p>
      </div>
    </div>
  );
}
