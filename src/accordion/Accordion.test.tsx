import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';
import type { AccordionItem } from './types';
import type { ReactElement } from 'react';

// Helper to render without React StrictMode duplicates
function renderWithoutStrictMode(ui: ReactElement) {
  return render(ui);
}

// Mock icon component
function MockIcon({ className }: { className?: string }) {
  return <div className={className} data-testid="mock-icon">Icon</div>;
}

const mockItems: AccordionItem[] = [
  {
    id: '1',
    title: 'Item 1',
    content: 'Content 1',
  },
  {
    id: '2',
    title: 'Item 2',
    subtitle: 'Subtitle 2',
    content: 'Content 2',
  },
  {
    id: '3',
    title: 'Item 3',
    content: 'Content 3',
    icon: MockIcon,
  },
];

describe('Accordion', () => {
  describe('Rendering', () => {
    it('renders all accordion items', () => {
      render(<Accordion items={mockItems} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders subtitles when provided', () => {
      const { container } = render(<Accordion items={mockItems} />);

      const subtitles = container.querySelectorAll('.lite-kit-accordion-subtitle');
      expect(subtitles.length).toBeGreaterThan(0);
      expect(subtitles[0]).toHaveTextContent('Subtitle 2');
    });

    it('renders icons when provided', () => {
      const { container } = render(<Accordion items={mockItems} />);

      const icons = container.querySelectorAll('[data-testid="mock-icon"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('applies custom className to container', () => {
      const { container } = render(
        <Accordion items={mockItems} className="custom-class" />
      );

      const accordion = container.querySelector('.lite-kit-accordion');
      expect(accordion).toHaveClass('custom-class');
    });

    it('applies custom itemClassName to items', () => {
      const { container } = render(
        <Accordion items={mockItems} itemClassName="custom-item-class" />
      );

      const items = container.querySelectorAll('.lite-kit-accordion-item');
      items.forEach((item) => {
        expect(item).toHaveClass('custom-item-class');
      });
    });
  });

  describe('Single mode behaviour', () => {
    it('opens an item when clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} mode="single" />);

      const accordion = container.querySelector('.lite-kit-accordion');
      expect(accordion).toBeInTheDocument();

      const button = within(accordion!).getByRole('button', { name: /Item 1/i });
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');

      const content = accordion!.querySelectorAll('.lite-kit-accordion-content--open');
      expect(content.length).toBeGreaterThan(0);
    });

    it('closes previously open item when opening another', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} mode="single" />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button1 = within(accordion).getByRole('button', { name: /Item 1/i });
      const button2 = within(accordion).getByRole('button', { name: /Item 2/i });

      // Open first item
      await user.click(button1);
      expect(button1).toHaveAttribute('aria-expanded', 'true');

      // Open second item
      await user.click(button2);
      expect(button1).toHaveAttribute('aria-expanded', 'false');
      expect(button2).toHaveAttribute('aria-expanded', 'true');
    });

    it('respects defaultOpen prop', () => {
      const { container } = render(<Accordion items={mockItems} mode="single" defaultOpen="2" />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 2/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('allows closing item when collapsible is true', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} mode="single" collapsible={true} />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });

      // Open item
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Close item
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('prevents closing when collapsible is false', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Accordion
          items={mockItems}
          mode="single"
          defaultOpen="1"
          collapsible={false}
        />
      );

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Try to close (should remain open)
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Multiple mode behaviour', () => {
    it('allows multiple items to be open simultaneously', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} mode="multiple" />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button1 = within(accordion).getByRole('button', { name: /Item 1/i });
      const button2 = within(accordion).getByRole('button', { name: /Item 2/i });

      await user.click(button1);
      await user.click(button2);

      expect(button1).toHaveAttribute('aria-expanded', 'true');
      expect(button2).toHaveAttribute('aria-expanded', 'true');
    });

    it('respects defaultOpen array in multiple mode', () => {
      const { container } = render(
        <Accordion items={mockItems} mode="multiple" defaultOpen={['1', '3']} />
      );

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button1 = within(accordion).getByRole('button', { name: /Item 1/i });
      const button3 = within(accordion).getByRole('button', { name: /Item 3/i });

      expect(button1).toHaveAttribute('aria-expanded', 'true');
      expect(button3).toHaveAttribute('aria-expanded', 'true');
    });

    it('allows closing items independently', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Accordion items={mockItems} mode="multiple" defaultOpen={['1', '2']} />
      );

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button1 = within(accordion).getByRole('button', { name: /Item 1/i });
      const button2 = within(accordion).getByRole('button', { name: /Item 2/i });

      // Both start open
      expect(button1).toHaveAttribute('aria-expanded', 'true');
      expect(button2).toHaveAttribute('aria-expanded', 'true');

      // Close first
      await user.click(button1);
      expect(button1).toHaveAttribute('aria-expanded', 'false');
      expect(button2).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Callbacks', () => {
    it('calls onValueChange when item is opened', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      const { container } = render(
        <Accordion items={mockItems} mode="single" onValueChange={onValueChange} />
      );

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });
      await user.click(button);

      expect(onValueChange).toHaveBeenCalledWith(['1']);
    });

    it('calls onValueChange when item is closed', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      const { container } = render(
        <Accordion
          items={mockItems}
          mode="single"
          defaultOpen="1"
          collapsible={true}
          onValueChange={onValueChange}
        />
      );

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });
      await user.click(button);

      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it('calls onValueChange with multiple IDs in multiple mode', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      const { container } = render(
        <Accordion
          items={mockItems}
          mode="multiple"
          onValueChange={onValueChange}
        />
      );

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button1 = within(accordion).getByRole('button', { name: /Item 1/i });
      const button2 = within(accordion).getByRole('button', { name: /Item 2/i });

      await user.click(button1);
      expect(onValueChange).toHaveBeenCalledWith(['1']);

      await user.click(button2);
      expect(onValueChange).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-expanded');
        expect(button).toHaveAttribute('aria-controls');
      });
    });

    it('associates content regions with headers', () => {
      const { container } = render(<Accordion items={mockItems} defaultOpen="1" />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });
      const contentId = button.getAttribute('aria-controls');

      expect(contentId).toBe('accordion-content-1');

      const content = document.getElementById(contentId!);
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('role', 'region');
    });

    it('has proper button type attribute', () => {
      render(<Accordion items={mockItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('BEM class names', () => {
    it('applies correct classes when item is closed', () => {
      const { container } = render(<Accordion items={mockItems} />);

      const item = container.querySelector('.lite-kit-accordion-item');
      expect(item).not.toHaveClass('lite-kit-accordion-item--open');

      const content = container.querySelector('.lite-kit-accordion-content');
      expect(content).toHaveClass('lite-kit-accordion-content--closed');
      expect(content).not.toHaveClass('lite-kit-accordion-content--open');
    });

    it('applies correct classes when item is open', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });
      await user.click(button);

      const openItems = accordion.querySelectorAll('.lite-kit-accordion-item--open');
      expect(openItems.length).toBeGreaterThan(0);

      const openContent = accordion.querySelectorAll('.lite-kit-accordion-content--open');
      expect(openContent.length).toBeGreaterThan(0);
    });

    it('applies icon-specific classes when icon is present', () => {
      const { container } = render(<Accordion items={mockItems} defaultOpen="3" />);

      const icon = container.querySelector('.lite-kit-accordion-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lite-kit-accordion-icon--active');
    });

    it('applies subtitle-specific classes when item is open', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 2/i });
      await user.click(button);

      const activeSubtitles = accordion.querySelectorAll('.lite-kit-accordion-subtitle--active');
      expect(activeSubtitles.length).toBeGreaterThan(0);
    });

    it('applies chevron classes with correct rotation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const chevrons = accordion.querySelectorAll('.lite-kit-accordion-chevron');
      expect(chevrons.length).toBeGreaterThan(0);

      const button = within(accordion).getByRole('button', { name: /Item 1/i });
      await user.click(button);

      const openChevrons = accordion.querySelectorAll('.lite-kit-accordion-chevron--open.rotate-180');
      expect(openChevrons.length).toBeGreaterThan(0);
    });
  });

  describe('CSS Variable Support', () => {
    it('applies all BEM classes for styling customisation', () => {
      const { container } = render(<Accordion items={mockItems} />);

      expect(container.querySelector('.lite-kit-accordion-item')).toBeInTheDocument();
      expect(container.querySelector('.lite-kit-accordion-title')).toBeInTheDocument();
      expect(container.querySelector('.lite-kit-accordion-chevron')).toBeInTheDocument();
      expect(container.querySelector('.lite-kit-accordion-content')).toBeInTheDocument();
      expect(container.querySelector('.lite-kit-accordion-content-inner')).toBeInTheDocument();
    });

    it('applies modifier classes for open state', async () => {
      const user = userEvent.setup();
      const { container } = render(<Accordion items={mockItems} />);

      const accordion = container.querySelector('.lite-kit-accordion')!;
      const button = within(accordion).getByRole('button', { name: /Item 1/i });

      // Initially closed
      const item = accordion.querySelector('[class*="lite-kit-accordion-item"]');
      expect(item).not.toHaveClass('lite-kit-accordion-item--open');

      // Open the item
      await user.click(button);

      // Should have open modifier
      expect(item).toHaveClass('lite-kit-accordion-item--open');
    });

    it('applies all text-related BEM classes', () => {
      const { container } = render(<Accordion items={mockItems} />);

      expect(container.querySelector('.lite-kit-accordion-text')).toBeInTheDocument();
      expect(container.querySelector('.lite-kit-accordion-title')).toBeInTheDocument();
      expect(container.querySelector('.lite-kit-accordion-subtitle')).toBeInTheDocument();
    });
  });
});
