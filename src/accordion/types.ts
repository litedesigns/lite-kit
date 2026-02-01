import type { ComponentType, ReactNode } from 'react';

export interface AccordionItem {
  /** Unique identifier for the item */
  id: string;
  /** Title displayed in the header */
  title: string;
  /** Content displayed when expanded */
  content: ReactNode;
  /** Optional icon component */
  icon?: ComponentType<{ className?: string }>;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
}

export interface ScrollConfig {
  /** Hysteresis threshold (0-1) - prevents jittery switching. Default: 0.3 */
  hysteresis?: number;
  /** Scroll item to viewport centre on manual tap. Default: true */
  scrollToCenter?: boolean;
  /** Only enable scroll detection on mobile devices (< 768px). Default: true */
  mobileOnly?: boolean;
}

export interface AccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];

  // Behaviour
  /** Control mode: 'single' keeps one open at a time, 'multiple' allows many. Default: 'single' */
  mode?: 'single' | 'multiple';
  /** Item ID(s) to open by default */
  defaultOpen?: string | string[];
  /** Allow closing all items when in single mode. Default: true */
  collapsible?: boolean;

  // Scroll detection (optional)
  /** Enable Mac Gallery style scroll-based auto-expansion */
  scrollDetect?: boolean;
  /** Configuration for scroll detection behaviour */
  scrollConfig?: ScrollConfig;

  // Styling
  /** Additional CSS class names for the container */
  className?: string;
  /** Additional CSS class names for individual items */
  itemClassName?: string;

  // Callbacks
  /** Called when open items change */
  onValueChange?: (openIds: string[]) => void;
}
