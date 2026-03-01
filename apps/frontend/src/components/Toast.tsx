import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, Play } from 'lucide-react';
import clsx from 'clsx';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'run';
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  run: Play,
};

const styles = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-primary/30 bg-primary/10 text-primary-hover',
  run: 'border-accent/30 bg-accent/10 text-accent',
};

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-soft min-w-[300px] max-w-[420px]',
        styles[toast.type]
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold tracking-wide">{toast.title}</p>
        <p className="text-xs opacity-80 mt-0.5 break-words font-medium">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="p-0.5 hover:opacity-60 transition-opacity shrink-0">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

let toastCounter = 0;
export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
