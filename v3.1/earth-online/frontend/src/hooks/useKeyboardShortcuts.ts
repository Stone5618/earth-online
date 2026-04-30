/**
 * useKeyboardShortcuts - 全局键盘快捷键管理
 * 
 * Handles:
 * - ESC to close panels/modals
 * - Number keys (1-9) for quick decision selection
 * - Ensures shortcuts only work when not typing in input fields
 * 
 * Usage:
 *   const { registerESC, registerNumberKeys } = useKeyboardShortcuts();
 *   registerESC(() => closePanel('save'));
 *   registerNumberKeys((index) => handleChoice(index), maxChoices);
 */

import { useEffect, useRef, useCallback } from 'react';

interface ShortcutConfig {
  /** Callback for ESC key */
  onESC?: () => void;
  /** Callback for number key presses (1-9), receives the 0-based index */
  onNumberKey?: (index: number) => void;
  /** Maximum number of choices for number key shortcuts (1-9) */
  maxNumberChoices?: number;
  /** Whether shortcuts should be disabled (e.g., when a modal is not open) */
  enabled?: boolean;
}

/**
 * Check if the currently focused element is an input-like element
 * where keyboard shortcuts should be suppressed
 */
function isTypingInInput(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  
  const tagName = active.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }
  
  // Check for contenteditable elements
  if (active.getAttribute('contenteditable') === 'true') {
    return true;
  }
  
  return false;
}

export function useKeyboardShortcuts(config: ShortcutConfig = {}) {
  const {
    onESC,
    onNumberKey,
    maxNumberChoices = 0,
    enabled = true,
  } = config;

  // Use refs to avoid stale closures
  const onESCRef = useRef(onESC);
  const onNumberKeyRef = useRef(onNumberKey);
  const maxNumberChoicesRef = useRef(maxNumberChoices);
  const enabledRef = useRef(enabled);

  // Update refs when config changes
  useEffect(() => {
    onESCRef.current = onESC;
    onNumberKeyRef.current = onNumberKey;
    maxNumberChoicesRef.current = maxNumberChoices;
    enabledRef.current = enabled;
  }, [onESC, onNumberKey, maxNumberChoices, enabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if shortcuts are disabled
    if (!enabledRef.current) return;
    
    // Skip if user is typing in an input field
    if (isTypingInInput()) return;

    // ESC handler
    if (e.key === 'Escape' && onESCRef.current) {
      e.preventDefault();
      onESCRef.current();
      return;
    }

    // Number key handler (1-9)
    if (onNumberKeyRef.current && maxNumberChoicesRef.current > 0) {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9 && num <= maxNumberChoicesRef.current) {
        e.preventDefault();
        onNumberKeyRef.current(num - 1); // Convert to 0-based index
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Convenience hook for ESC-to-close panels
 */
export function useESCToClose(onClose: () => void, enabled = true) {
  useKeyboardShortcuts({
    onESC: onClose,
    enabled,
  });
}

/**
 * Convenience hook for number key quick selection
 */
export function useNumberKeySelection(
  onSelect: (index: number) => void,
  maxChoices: number,
  enabled = true,
) {
  useKeyboardShortcuts({
    onNumberKey: onSelect,
    maxNumberChoices: maxChoices,
    enabled,
  });
}
