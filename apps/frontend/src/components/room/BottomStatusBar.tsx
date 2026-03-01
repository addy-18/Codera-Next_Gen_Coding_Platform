import { Wifi, WifiOff } from 'lucide-react';

interface BottomStatusBarProps {
  isConnected: boolean;
  canEdit: boolean;
  languageName: string;
}

export function BottomStatusBar({ isConnected, canEdit, languageName }: BottomStatusBarProps) {
  return (
    <div className="h-8 bg-surface border-t border-border flex items-center justify-between px-4 shrink-0 text-[11px] font-medium tracking-wide uppercase text-muted z-20">
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-success" />
              <span className="text-success">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-danger" />
              <span className="text-danger">Offline</span>
            </>
          )}
        </div>
        
        {/* Edit Permission Status */}
        <div className="flex items-center gap-1.5 border-l border-border pl-4">
          {canEdit ? (
            <span className="text-white">Writable</span>
          ) : (
            <span className="text-accent">Read-Only</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">UTF-8</span>
        <span className="border-l border-border pl-4">{languageName}</span>
      </div>
    </div>
  );
}
