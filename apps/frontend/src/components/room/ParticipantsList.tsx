import { ShieldAlert, Users } from 'lucide-react';
import clsx from 'clsx';
import { PermissionToggle } from './PermissionToggle';
import type { RoomParticipant } from '../../hooks/useRoomSocket';

interface ParticipantsListProps {
  participants: RoomParticipant[];
  currentUserId: string;
  isHost: boolean;
  onTogglePermission: (userId: string, currentCanEdit: boolean) => void;
}

export function ParticipantsList({ participants, currentUserId, isHost, onTogglePermission }: ParticipantsListProps) {
  // Simple deterministic color for avatars based on name length
  const getAvatarColor = (name: string) => {
    const colors = ['bg-primary hover:bg-primary-hover', 'bg-accent text-base hover:bg-accent-hover text-black', 'bg-success hover:bg-success/80', 'bg-danger hover:bg-danger/80'];
    return colors[name.length % colors.length];
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-white/5">
      <div className="h-10 border-b border-border flex items-center px-4 bg-elevated/30 shrink-0">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> Participants ({participants.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((p) => {
          const isMe = p.userId === currentUserId;
          const showToggle = isHost && p.role !== 'host';

          return (
            <div 
              key={p.userId} 
              className={clsx(
                "group flex items-center justify-between p-3 rounded-xl border transition-all",
                isMe ? "bg-white/5 border-white/10" : "bg-transparent border-transparent hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-soft transition-colors",
                  getAvatarColor(p.username)
                )}>
                  {p.username.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-main">
                      {p.username}
                      {isMe && <span className="text-muted ml-1 font-normal">(you)</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={clsx(
                      "text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider",
                      p.role === 'host' ? 'bg-primary/20 text-primary-hover' : 'bg-white/10 text-muted'
                    )}>
                      {p.role}
                    </span>
                    {!p.canEdit && p.role !== 'host' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider bg-danger/10 text-danger flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" /> View Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {showToggle && (
                <div>
                  <PermissionToggle 
                    userId={p.userId} 
                    canEdit={p.canEdit} 
                    onToggle={onTogglePermission} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
