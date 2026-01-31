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
        'transition-transform duration-300',
        isOpen && 'rotate-180',
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
  scrollConfig,
  variant = 'default',
  theme = 'system',
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

  // Theme data attribute
  const themeAttr = theme !== 'system' ? { 'data-theme': theme } : {};

  // Variant styles
  const getContainerStyles = () => {
    switch (variant) {
      case 'card':
        return 'space-y-4';
      case 'minimal':
        return 'divide-y divide-[var(--accordion-border)]';
      default:
        return 'space-y-2';
    }
  };

  const getItemStyles = (isOpen: boolean) => {
    const base = 'transition-all duration-300 ease-out';

    switch (variant) {
      case 'card':
        return cn(
          base,
          'rounded-lg border border-[var(--accordion-border)] bg-[var(--accordion-bg)]',
          'shadow-sm backdrop-blur-sm',
          isOpen && 'ring-1 ring-[var(--accordion-border)]'
        );
      case 'minimal':
        return cn(base, 'bg-transparent');
      default:
        return cn(
          base,
          'rounded-lg border border-[var(--accordion-border)] bg-[var(--accordion-bg)]',
          'overflow-hidden'
        );
    }
  };

  return (
    <div
      className={cn('lite-kit-accordion', getContainerStyles(), className)}
      {...themeAttr}
    >
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            className={cn(getItemStyles(isOpen), itemClassName)}
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => handleToggle(item, index)}
              className={cn(
                'w-full flex items-center gap-4 p-4 text-left cursor-pointer',
                'transition-colors duration-200',
                'active:scale-[0.99]'
              )}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              {/* Icon */}
              {Icon && (
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center',
                    'transition-all duration-500',
                    isOpen
                      ? 'bg-[var(--accordion-icon-bg-active)]'
                      : 'bg-[var(--accordion-icon-bg)]'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors duration-300',
                      isOpen
                        ? 'text-[var(--accordion-icon-active)]'
                        : 'text-[var(--accordion-icon)]'
                    )}
                  />
                </div>
              )}

              {/* Title and subtitle */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-semibold text-[var(--accordion-text)]',
                    variant === 'minimal' ? 'text-base' : 'text-base'
                  )}
                >
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p
                    className={cn(
                      'text-sm transition-colors duration-300 mt-0.5',
                      isOpen
                        ? 'text-[var(--accordion-text-muted)]'
                        : 'text-[var(--accordion-text-subtle)]'
                    )}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Chevron */}
              <ChevronIcon
                className="flex-shrink-0 text-[var(--accordion-text-muted)]"
                isOpen={isOpen}
              />
            </button>

            {/* Content */}
            <div
              id={`accordion-content-${item.id}`}
              className={cn(
                'overflow-hidden transition-all duration-500 ease-out',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
            >
              <div
                className={cn(
                  'text-[var(--accordion-text-muted)] leading-relaxed',
                  Icon ? 'px-4 pb-4 pl-20' : 'px-4 pb-4',
                  variant === 'minimal' && 'px-0 pb-4'
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
