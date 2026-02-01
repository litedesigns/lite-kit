'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../utils/cn';
import type { AccordionProps, AccordionItem } from './types';

// Chevron icon component (inline to avoid external dependency)
function ChevronIcon({ className, isOpen }: { className?: string; isOpen: boolean }) {
  return (
    <svg
      className={cn(
        'lite-kit-accordion-chevron w-5 h-5 flex-shrink-0 transition-transform duration-300',
        isOpen && 'lite-kit-accordion-chevron--open rotate-180',
        className
      )}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function Accordion({
  items,
  mode = 'single',
  defaultOpen,
  collapsible = true,
  scrollDetect = false,
  scrollConfig = {},
  className,
  itemClassName,
  onValueChange,
}: AccordionProps) {
  const {
    threshold = 0.4,
    cooldown = 800,
    scrollToCenter = true,
    mobileOnly = true,
    headerOffset = 0,
  } = scrollConfig;

  // Initialise open state
  const getInitialOpenIds = (): string[] => {
    if (!defaultOpen) return [];
    if (Array.isArray(defaultOpen)) return defaultOpen;
    return [defaultOpen];
  };

  const [openIds, setOpenIds] = useState<string[]>(getInitialOpenIds);
  const [isMobile, setIsMobile] = useState(false);
  const [manuallySelected, setManuallySelected] = useState(false);
  const [manuallyClosedId, setManuallyClosedId] = useState<string | null>(null);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine if scroll detection should be active
  const isScrollDetectionActive = scrollDetect && (!mobileOnly || isMobile);

  // Handle item toggle
  const handleToggle = useCallback((item: AccordionItem, index: number) => {
    const isOpen = openIds.includes(item.id);

    if (isScrollDetectionActive) {
      // Mark as manually selected to pause scroll detection
      setManuallySelected(true);

      // Scroll to centre if enabled and opening
      if (scrollToCenter && !isOpen) {
        const element = itemRefs.current[index];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }

      // Re-enable scroll detection after cooldown
      if (manualTimeoutRef.current) {
        clearTimeout(manualTimeoutRef.current);
      }
      manualTimeoutRef.current = setTimeout(() => {
        setManuallySelected(false);
      }, cooldown);
    }

    if (isOpen) {
      // Closing
      if (collapsible || openIds.length > 1) {
        if (isScrollDetectionActive) {
          // Mark as manually closed so scroll won't reopen it
          setManuallyClosedId(item.id);
        }
        const newIds = openIds.filter(id => id !== item.id);
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    } else {
      // Opening
      setManuallyClosedId(null);

      if (mode === 'single') {
        setOpenIds([item.id]);
        onValueChange?.([item.id]);
      } else {
        const newIds = [...openIds, item.id];
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    }
  }, [openIds, mode, collapsible, isScrollDetectionActive, scrollToCenter, cooldown, onValueChange]);

  // Scroll detection effect - simple viewport centre detection
  useEffect(() => {
    if (!isScrollDetectionActive) return;

    const handleScroll = () => {
      // Reset manual selection after scrolling stops
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setManuallySelected(false);
      }, 150);

      // Don't override during manual interaction
      if (manuallySelected) return;

      const viewportHeight = window.innerHeight;
      const effectiveViewportHeight = viewportHeight - headerOffset;
      const viewportCenter = headerOffset + effectiveViewportHeight / 2;

      let closestIndex = -1;
      let closestDistance = Infinity;

      itemRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Only expand if the card is reasonably close to centre
      if (closestIndex >= 0 && closestDistance < effectiveViewportHeight * threshold) {
        const closestId = items[closestIndex]?.id;

        // If user manually closed a different card, clear that state
        if (manuallyClosedId !== null && closestId !== manuallyClosedId) {
          setManuallyClosedId(null);
        }

        // Don't reopen a manually closed card
        if (closestId !== manuallyClosedId && closestId !== openIds[0]) {
          setOpenIds([closestId]);
          onValueChange?.([closestId]);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrollDetectionActive, manuallySelected, manuallyClosedId, items, openIds, threshold, headerOffset, onValueChange]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    };
  }, []);

  return (
    <div className={cn('lite-kit-accordion space-y-3', className)}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            className={cn(
              'lite-kit-accordion-item overflow-hidden transition-all duration-300 ease-out',
              isOpen && 'lite-kit-accordion-item--open',
              itemClassName
            )}
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => handleToggle(item, index)}
              className={cn(
                'lite-kit-accordion-header',
                'w-full flex items-center gap-4 p-4 text-left cursor-pointer',
                'transition-colors duration-200 active:scale-[0.99]'
              )}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              {/* Icon */}
              {Icon && (
                <div
                  className={cn(
                    'lite-kit-accordion-icon',
                    'w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center',
                    'transition-all duration-300',
                    isOpen && 'lite-kit-accordion-icon--active'
                  )}
                >
                  <Icon className="lite-kit-accordion-icon-svg w-6 h-6 transition-colors duration-300" />
                </div>
              )}

              {/* Title and subtitle */}
              <div className="lite-kit-accordion-text flex-1 min-w-0">
                <h3 className="lite-kit-accordion-title font-semibold text-sm">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p
                    className={cn(
                      'lite-kit-accordion-subtitle text-xs mt-0.5 transition-colors duration-300',
                      isOpen && 'lite-kit-accordion-subtitle--active'
                    )}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Chevron */}
              <ChevronIcon isOpen={isOpen} className="lite-kit-accordion-chevron-icon" />
            </button>

            {/* Content */}
            <div
              id={`accordion-content-${item.id}`}
              className={cn(
                'lite-kit-accordion-content',
                'overflow-hidden transition-all duration-300 ease-out',
                isOpen
                  ? 'lite-kit-accordion-content--open max-h-96 opacity-100'
                  : 'lite-kit-accordion-content--closed max-h-0 opacity-0'
              )}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
            >
              <div
                className={cn(
                  'lite-kit-accordion-content-inner text-sm leading-relaxed',
                  Icon ? 'px-4 pb-4 pl-20' : 'px-4 pb-4'
                )}
              >
                {typeof item.content === 'string' ? (
                  <p>{item.content}</p>
                ) : (
                  item.content
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
