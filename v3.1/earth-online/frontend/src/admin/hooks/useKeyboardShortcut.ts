import { useEffect } from 'react';

interface UseKeyboardShortcutOptions {
  onSubmit?: () => void;
  onCancel?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcut({ onSubmit, onCancel, enabled = true }: UseKeyboardShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit, onCancel, enabled]);
}
