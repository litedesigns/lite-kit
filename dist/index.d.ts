import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, ComponentType } from 'react';

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
    /** Viewport threshold (0-1) - how close to centre card must be to auto-expand. Default: 0.4 */
    threshold?: number;
    /** Cooldown in ms after manual interaction before scroll detection resumes. Default: 800 */
    cooldown?: number;
    /** Scroll clicked item to viewport centre. Default: true */
    scrollToCenter?: boolean;
    /** Only enable scroll detection on mobile devices (< 768px). Default: true */
    mobileOnly?: boolean;
    /** Fixed header height in pixels to offset scroll calculations. Default: 0 */
    headerOffset?: number;
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
    /** Enable scroll-based auto-expansion on mobile */
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

/**
 * Utility function for merging class names
 * Filters out falsy values and joins remaining classes
 */
declare function cn(...classes: (string | undefined | null | false)[]): string;

export { Accordion, type AccordionItem, type AccordionProps, type ScrollConfig, cn };
