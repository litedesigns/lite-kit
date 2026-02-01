import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, ComponentType, RefObject } from 'react';

interface AccordionItem {
    /** Unique identifier for the item */
    id: string;
    /** Title displayed in the header */
    title: string;
    /** Content displayed when expanded */
    content: ReactNode;
    /** Optional icon component */
    icon?: ComponentType<{
        className?: string;
    }>;
    /** Optional subtitle displayed below the title */
    subtitle?: string;
}
interface ScrollConfig {
    /** Hysteresis threshold (0-1) - prevents jittery switching. Default: 0.3 */
    hysteresis?: number;
    /** Scroll item to viewport centre on manual tap. Default: true */
    scrollToCenter?: boolean;
    /** Only enable scroll detection on mobile devices (< 768px). Default: true */
    mobileOnly?: boolean;
}
interface AccordionProps {
    /** Array of accordion items */
    items: AccordionItem[];
    /** Control mode: 'single' keeps one open at a time, 'multiple' allows many. Default: 'single' */
    mode?: 'single' | 'multiple';
    /** Item ID(s) to open by default */
    defaultOpen?: string | string[];
    /** Allow closing all items when in single mode. Default: true */
    collapsible?: boolean;
    /** Enable Mac Gallery style scroll-based auto-expansion */
    scrollDetect?: boolean;
    /** Configuration for scroll detection behaviour */
    scrollConfig?: ScrollConfig;
    /** Additional CSS class names for the container */
    className?: string;
    /** Additional CSS class names for individual items */
    itemClassName?: string;
    /** Called when open items change */
    onValueChange?: (openIds: string[]) => void;
}

declare function Accordion({ items, mode, defaultOpen, collapsible, scrollDetect, scrollConfig, className, itemClassName, onValueChange, }: AccordionProps): react_jsx_runtime.JSX.Element;

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
declare function useScrollDetection({ itemRefs, itemCount, enabled, config, onActiveChange, activeIndex, }: UseScrollDetectionProps): UseScrollDetectionReturn;

/**
 * Utility function for merging class names
 * Filters out falsy values and joins remaining classes
 */
declare function cn(...classes: (string | undefined | null | false)[]): string;

export { Accordion, type AccordionItem, type AccordionProps, type ScrollConfig, cn, useScrollDetection };
