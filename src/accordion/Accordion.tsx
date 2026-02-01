'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../utils/cn';
import { useScrollDetection } from './useScrollDetection';
import type { AccordionProps, AccordionItem } from './types';

// Chevron icon component (inline to avoid external dependency)
function ChevronIcon({ className, isOpen }: { className?: string; isOpen: boolean }) {
  return (
    <svg
      className={cn(
        'lite-kit-accordion-chevron w-4 h-4 flex-shrink-0 transition-transform duration-300',
        isOpen && 'lite-kit-accordion-chevron--open rotate-180',
        className
      )}
      width="16"
      height="16"
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
  scrollConfig,
  className,
  itemClassName,
  onValueChange,
}: AccordionProps) {
  // Initialise open state
  const getInitialOpenIds = (): string[] => {
    if (!defaultOpen) return [];
    if (Array.isArray(defaultOpen)) return defaultOpen;
    return [defaultOpen];
  };

  const [openIds, setOpenIds] = useState<string[]>(getInitialOpenIds);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [manuallyClosedId, setManuallyClosedId] = useState<string | null>(null);

  // Convert index to id for scroll detection
  const activeIndex = openIds.length > 0
    ? items.findIndex(item => item.id === openIds[0])
    : null;

  // Scroll detection hook
  const {
    handleManualInteraction,
    isManuallySelected,
    manuallyClosedIndex,
    clearManuallyClosed,
  } = useScrollDetection({
    itemRefs,
    itemCount: items.length,
    enabled: scrollDetect,
    config: scrollConfig,
    activeIndex,
    onActiveChange: (index) => {
      if (index !== null) {
        const newId = items[index]?.id;
        if (newId && newId !== manuallyClosedId) {
          setOpenIds([newId]);
          onValueChange?.([newId]);
        }
      }
    },
  });

  // Handle item toggle
  const handleToggle = useCallback((item: AccordionItem, index: number) => {
    const isOpen = openIds.includes(item.id);

    if (scrollDetect) {
      handleManualInteraction(index);
    }

    if (isOpen) {
      // Closing
      if (collapsible || openIds.length > 1) {
        if (scrollDetect) {
          setManuallyClosedId(item.id);
        }
        const newIds = openIds.filter(id => id !== item.id);
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    } else {
      // Opening
      setManuallyClosedId(null);
      clearManuallyClosed();

      if (mode === 'single') {
        setOpenIds([item.id]);
        onValueChange?.([item.id]);
      } else {
        const newIds = [...openIds, item.id];
        setOpenIds(newIds);
        onValueChange?.(newIds);
      }
    }
  }, [openIds, mode, collapsible, scrollDetect, handleManualInteraction, clearManuallyClosed, onValueChange]);

  // Clear manually closed state when scrolling away
  useEffect(() => {
    if (manuallyClosedIndex !== null) {
      const closedId = items[manuallyClosedIndex]?.id;
      if (closedId !== manuallyClosedId) {
        setManuallyClosedId(null);
      }
    }
  }, [manuallyClosedIndex, items, manuallyClosedId]);

  return (
    <div className={cn('lite-kit-accordion space-y-2', className)}>
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
                <h3 className="lite-kit-accordion-title text-sm font-medium">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p
                    className={cn(
                      'lite-kit-accordion-subtitle text-sm mt-0.5 transition-colors duration-300',
                      isOpen && 'lite-kit-accordion-subtitle--active'
                    )}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Chevron in circle */}
              <div
                className={cn(
                  'lite-kit-accordion-toggle',
                  'w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center',
                  'transition-all duration-300',
                  isOpen && 'lite-kit-accordion-toggle--open'
                )}
              >
                <ChevronIcon isOpen={isOpen} />
              </div>
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
                  'lite-kit-accordion-content-inner leading-relaxed',
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
