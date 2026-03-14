import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-md mx-4 bg-secondary/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        style={{ animationDuration: '200ms' }}
      >
        {/* Header accent bar */}
        <div className={`h-1 w-full ${isDanger ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-primary to-accent'}`} />

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`shrink-0 p-2.5 rounded-xl ${isDanger ? 'bg-red-500/10' : 'bg-primary/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDanger ? 'text-red-400' : 'text-primary'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 border border-white/10 transition-all hover:border-white/20"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                isDanger
                  ? 'bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
