import { useState, useCallback, useRef } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | 'any';

interface SwipeToCloseOptions {
  /** Minimum swipe distance (in px) to trigger close. Default: 100 */
  threshold?: number;
  /** Allowed swipe direction(s) to trigger close. Default: 'any' */
  direction?: SwipeDirection;
  /** Callback invoked when swipe-to-close is triggered */
  onClose: () => void;
  /** Whether to provide visual feedback during swipe. Default: true */
  enableFeedback?: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  /** Current swipe offset distance from start point in the swipe direction */
  offset: number;
  /** Current swipe progress (0-1 normalized) for visual feedback */
  progress: number;
}

/**
 * Hook for detecting swipe gestures to close panels/modals.
 *
 * Features:
 * - Configurable distance threshold (default 100px for mobile ergonomics)
 * - Velocity detection for fast swipes (triggers even below threshold)
 * - Direction filtering (left/right/up/down/any)
 * - Cumulative offset for visual feedback
 * - Progress value (0-1) for animations
 */
export function useSwipeToClose({
  threshold = 100,
  direction = 'any',
  onClose,
  enableFeedback = true,
}: SwipeToCloseOptions): SwipeHandlers {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const touchStartTimeRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    touchStartTimeRef.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchEnd = useCallback(() => {
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;

    // Determine effective distance based on allowed direction
    let effectiveDistance = 0;
    switch (direction) {
      case 'left':
        effectiveDistance = Math.max(0, -dx); // Swipe left = negative dx
        break;
      case 'right':
        effectiveDistance = Math.max(0, dx); // Swipe right = positive dx
        break;
      case 'up':
        effectiveDistance = Math.max(0, -dy); // Swipe up = negative dy
        break;
      case 'down':
        effectiveDistance = Math.max(0, dy); // Swipe down = positive dy
        break;
      case 'any':
      default:
        effectiveDistance = Math.sqrt(dx * dx + dy * dy);
        break;
    }

    const elapsed = Date.now() - touchStartTimeRef.current;
    const velocity = elapsed > 0 ? effectiveDistance / elapsed : 0;

    // Trigger close if distance exceeds threshold,
    // or if velocity is high enough (fast flick gesture > 0.5 px/ms)
    const velocityThreshold = 0.5; // px/ms
    if (effectiveDistance > threshold || (effectiveDistance > threshold * 0.4 && velocity > velocityThreshold)) {
      onClose();
    }
  }, [touchStart, touchEnd, threshold, direction, onClose]);

  const dx = touchEnd.x - touchStart.x;
  const dy = touchEnd.y - touchStart.y;

  let effectiveOffset = 0;
  switch (direction) {
    case 'left':
      effectiveOffset = Math.max(0, -dx);
      break;
    case 'right':
      effectiveOffset = Math.max(0, dx);
      break;
    case 'up':
      effectiveOffset = Math.max(0, -dy);
      break;
    case 'down':
      effectiveOffset = Math.max(0, dy);
      break;
    case 'any':
    default:
      effectiveOffset = Math.sqrt(dx * dx + dy * dy);
      break;
  }

  const progress = enableFeedback ? Math.min(1, effectiveOffset / threshold) : 0;

  return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, offset: effectiveOffset, progress };
}
