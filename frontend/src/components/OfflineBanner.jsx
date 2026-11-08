import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md border-b border-amber-600 z-50"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm font-semibold">
        <div className="flex items-center gap-2">
          <WifiOff className="w-5 h-5 shrink-0 text-slate-950 animate-pulse" />
          <span>
            Sin conexión a internet. Operando en Modo Resiliente Offline.
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-400/80 px-2.5 py-1 rounded-md text-slate-900">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Teléfonos SOS (105, 116, 106) y caché barrial disponibles
          </span>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;