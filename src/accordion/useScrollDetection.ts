import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import type { ScrollConfig } from './types';

interface UseScrollDetectionProps {
  /** Array of refs to track */
  itemRefs: RefObject<(HTMLElement | null)[]>;
  /** Number of items */
  itemCount: number;
  /** Whether scroll detection is enabled */
  enabled: boolean;
  /** Configuration options */
  config?: ScrollConfig;
  /** Callback when active item changes */
  onActiveChange: (index: number | null) => void;
  /** Currently active index (for hysteresis comparison) */
  activeIndex: number | null;
}

interface UseScrollDetectionReturn {
  /** Call this when user manually interacts */
  handleManualInteraction: (index: number) => void;
  /** Whether manual interaction is active (temporarily disables scroll detection) */
  isManuallySelected: boolean;
  /** Index of manually closed item (won't auto-reopen) */
  manuallyClosedIndex: number | null;
  /** Clear manually closed state */
  clearManuallyClosed: () => void;
}

export function useScrollDetection({
  itemRefs,
  itemCount,
  enabled,
  config = {},
  onActiveChange,
  activeIndex,
}: UseScrollDetectionProps): UseScrollDetectionReturn {
  const { hysteresis = 0.3, scrollToCenter = true, mobileOnly = true } = config;

  const [isManuallySelected, setIsManuallySelected] = useState(false);
  const [manuallyClosedIndex, setManuallyClosedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const manualInteractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine if scroll detection should be active
  const isScrollDetectionActive = enabled && (!mobileOnly || isMobile);

  // Handle manual tap/click interaction
  const handleManualInteraction = useCallback((index: number) => {
    // Only apply scroll detection behaviour when active
    if (!isScrollDetectionActive) return;

    setIsManuallySelected(true);

    // Scroll to centre if enabled
    if (scrollToCenter && itemRefs.current) {
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    // Clear any existing timeout
    if (manualInteractionTimeoutRef.current) {
      clearTimeout(manualInteractionTimeoutRef.current);
    }

    // Re-enable scroll detection after scroll completes
    manualInteractionTimeoutRef.current = setTimeout(() => {
      setIsManuallySelected(false);
    }, 800);
  }, [scrollToCenter, itemRefs, isScrollDetectionActive]);

  // Mark an item as manually closed
  const markAsManuallyClosed = useCallback((index: number) => {
    setManuallyClosedIndex(index);
  }, []);

  // Clear manually closed state
  const clearManuallyClosed = useCallback(() => {
    setManuallyClosedIndex(null);
  }, []);

  // Scroll detection effect
  useEffect(() => {
    if (!isScrollDetectionActive) return;

    const handleScroll = () => {
      // Don't override during manual interaction
      if (isManuallySelected) return;

      const refs = itemRefs.current;
      if (!refs) return;

      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      // Find the item whose centre is closest to viewport centre
      let closestIndex: number | null = null;
      let closestDistance = Infinity;

      for (let i = 0; i < itemCount; i++) {
        const ref = refs[i];
        if (!ref) continue;

        const rect = ref.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        // Only consider items at least partially visible
        if (rect.bottom > 0 && rect.top < viewportHeight) {
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        }
      }

      // Apply hysteresis to prevent jittery switching
      if (closestIndex !== null && closestIndex !== activeIndex) {
        if (activeIndex !== null && refs[activeIndex]) {
          const currentRect = refs[activeIndex]!.getBoundingClientRect();
          const currentDistance = Math.abs(
            currentRect.top + currentRect.height / 2 - viewportCenter
          );

          // Only switch if new item is significantly closer
          const threshold = 1 - hysteresis;
          if (closestDistance >= currentDistance * threshold) {
            return; // Current item is still close enough
          }
        }

        // Clear manually closed state if scrolling to a different item
        if (manuallyClosedIndex !== null && closestIndex !== manuallyClosedIndex) {
          setManuallyClosedIndex(null);
        }

        // Only activate if not manually closed
        if (closestIndex !== manuallyClosedIndex) {
          onActiveChange(closestIndex);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    isScrollDetectionActive,
    isManuallySelected,
    itemRefs,
    itemCount,
    hysteresis,
    activeIndex,
    manuallyClosedIndex,
    onActiveChange,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (manualInteractionTimeoutRef.current) {
        clearTimeout(manualInteractionTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleManualInteraction,
    isManuallySelected,
    manuallyClosedIndex,
    clearManuallyClosed,
  };
}

// Helper to set manually closed (exposed for component use)
export function useManualClose() {
  const [manuallyClosedIndex, setManuallyClosedIndex] = useState<number | null>(null);

  return {
    manuallyClosedIndex,
    setManuallyClosed: setManuallyClosedIndex,
    clearManuallyClosed: () => setManuallyClosedIndex(null),
  };
}
