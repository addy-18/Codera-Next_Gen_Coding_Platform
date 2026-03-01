import clsx from 'clsx';
import { Shield, ShieldOff } from 'lucide-react';

interface PermissionToggleProps {
  userId: string;
  canEdit: boolean;
  onToggle: (userId: string, current: boolean) => void;
  disabled?: boolean;
}

export function PermissionToggle({ userId, canEdit, onToggle, disabled }: PermissionToggleProps) {
  return (
    <button
      disabled={disabled}
      onClick={() => onToggle(userId, canEdit)}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75",
        canEdit ? 'bg-success' : 'bg-muted',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="switch"
      aria-checked={canEdit}
      title={canEdit ? "Revoke edit access" : "Grant edit access"}
    >
      <span className="sr-only">Toggle edit permission</span>
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center",
          canEdit ? 'translate-x-4' : 'translate-x-0'
        )}
      >
        {canEdit ? (
          <Shield className="w-2.5 h-2.5 text-success" />
        ) : (
          <ShieldOff className="w-2.5 h-2.5 text-muted" />
        )}
      </span>
    </button>
  );
}
