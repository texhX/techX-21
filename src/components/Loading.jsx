import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      {message && <p className="text-sm font-medium text-slate-400">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
