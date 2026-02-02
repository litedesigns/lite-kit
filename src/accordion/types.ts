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
  /** Hysteresis margin in pixels - prevents flickering by requiring new item to be significantly closer. Default: 50 */
  hysteresis?: number;
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
  /** Enable scroll-based auto-expansion on mobile */
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
