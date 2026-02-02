import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Accordion } from './Accordion';
import type { AccordionItem } from './types';

// Example icons for stories
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

const basicItems: AccordionItem[] = [
  {
    id: '1',
    title: 'Getting Started',
    content: 'Learn the basics of our platform with step-by-step tutorials and guides.',
  },
  {
    id: '2',
    title: 'Advanced Features',
    content: 'Explore powerful features and customisation options for advanced users.',
  },
  {
    id: '3',
    title: 'Troubleshooting',
    content: 'Find solutions to common issues and get help when things go wrong.',
  },
];

const itemsWithIcons: AccordionItem[] = [
  {
    id: '1',
    title: 'Featured Content',
    subtitle: 'Popular and trending items',
    content: 'Discover our most popular content curated just for you.',
    icon: StarIcon,
  },
  {
    id: '2',
    title: 'Documentation',
    subtitle: 'Comprehensive guides',
    content: 'Access detailed documentation and API references.',
    icon: BookIcon,
  },
  {
    id: '3',
    title: 'Tips & Tricks',
    subtitle: 'Pro tips for power users',
    content: 'Learn insider tricks to maximise productivity.',
    icon: LightbulbIcon,
  },
];

const scrollItems: AccordionItem[] = [
  {
    id: '1',
    title: 'Introduction',
    subtitle: 'Start your journey here',
    content: 'Welcome to our platform. This section will introduce you to the core concepts and help you get started quickly.',
    icon: StarIcon,
  },
  {
    id: '2',
    title: 'Basic Setup',
    subtitle: 'Configure your environment',
    content: 'Follow these simple steps to set up your development environment and install the necessary dependencies.',
    icon: BookIcon,
  },
  {
    id: '3',
    title: 'Core Concepts',
    subtitle: 'Understanding the fundamentals',
    content: 'Learn about the fundamental concepts that power our platform, including components, state management, and data flow.',
    icon: LightbulbIcon,
  },
  {
    id: '4',
    title: 'Advanced Patterns',
    subtitle: 'Level up your skills',
    content: 'Explore advanced patterns and techniques used by experienced developers to build scalable applications.',
    icon: StarIcon,
  },
  {
    id: '5',
    title: 'Best Practices',
    subtitle: 'Write better code',
    content: 'Discover industry best practices for writing clean, maintainable, and performant code.',
    icon: BookIcon,
  },
  {
    id: '6',
    title: 'Deployment',
    subtitle: 'Ship to production',
    content: 'Learn how to deploy your application to production with confidence using modern deployment strategies.',
    icon: LightbulbIcon,
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible accordion component with support for single/multiple modes, icons, scroll detection, and extensive customisation via BEM classes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of accordion items to display',
      control: { disable: true },
    },
    mode: {
      description: 'Control mode: "single" keeps one item open, "multiple" allows many',
      control: 'radio',
      options: ['single', 'multiple'],
    },
    defaultOpen: {
      description: 'Item ID(s) to open by default',
      control: 'text',
    },
    collapsible: {
      description: 'Allow closing all items when in single mode',
      control: 'boolean',
    },
    scrollDetect: {
      description: 'Enable scroll-based auto-expansion on mobile',
      control: 'boolean',
    },
    scrollConfig: {
      description: 'Configuration for scroll detection behaviour',
      control: { disable: true },
    },
    className: {
      description: 'Additional CSS classes for the container',
      control: 'text',
    },
    itemClassName: {
      description: 'Additional CSS classes for individual items',
      control: 'text',
    },
    onValueChange: {
      description: 'Callback when open items change',
      action: 'valueChanged',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: basicItems,
    mode: 'single',
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic accordion in single mode. Click items to expand/collapse.',
      },
    },
  },
};

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
    mode: 'single',
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion items with icons and subtitles for enhanced visual hierarchy.',
      },
    },
  },
};

export const MultipleMode: Story = {
  args: {
    items: basicItems,
    mode: 'multiple',
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple mode allows several items to be open simultaneously.',
      },
    },
  },
};

export const DefaultOpen: Story = {
  args: {
    items: basicItems,
    mode: 'single',
    defaultOpen: '2',
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with the second item pre-opened using defaultOpen prop.',
      },
    },
  },
};

export const NotCollapsible: Story = {
  args: {
    items: basicItems,
    mode: 'single',
    defaultOpen: '1',
    collapsible: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Non-collapsible mode ensures at least one item is always open.',
      },
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    items: itemsWithIcons,
    mode: 'single',
    collapsible: true,
    className: 'custom-accordion',
  },
  parameters: {
    docs: {
      description: {
        story: 'Accordion with custom styling applied via BEM classes. This example uses a gradient background and custom colours.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <style>{`
          .custom-accordion .lite-kit-accordion-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
          }
          .custom-accordion .lite-kit-accordion-icon {
            background: rgba(255, 255, 255, 0.2);
          }
          .custom-accordion .lite-kit-accordion-icon--active {
            background: rgba(255, 255, 255, 0.3);
          }
          .custom-accordion .lite-kit-accordion-subtitle {
            color: rgba(255, 255, 255, 0.8);
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
};

export const ScrollDetection: Story = {
  args: {
    items: scrollItems,
    mode: 'single',
    collapsible: true,
    scrollDetect: true,
    scrollConfig: {
      threshold: 0.4,
      cooldown: 800,
      scrollToCenter: true,
      mobileOnly: false,
      headerOffset: 0,
      hysteresis: 50,
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Scroll detection demo. Scroll up/down and items will automatically expand when near viewport centre. Click an item to manually override (cooldown: 800ms).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '200vh', padding: '50vh 2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export const CSSVariableTheming: Story = {
  name: 'CSS Variable Theming',
  args: {
    items: itemsWithIcons,
    mode: 'single',
    collapsible: true,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          '--lk-accordion-item-bg': 'rgb(255, 255, 255)',
          '--lk-accordion-item-border': 'rgb(229, 231, 235)',
          '--lk-accordion-item-border-hover': 'rgb(209, 213, 219)',
          '--lk-accordion-item-shadow-hover': '0 4px 6px rgba(0, 0, 0, 0.1)',
          '--lk-accordion-title-color': 'rgb(17, 24, 39)',
          '--lk-accordion-icon-bg': 'rgb(243, 244, 246)',
          '--lk-accordion-icon-bg-active': 'rgb(229, 231, 235)',
        } as React.CSSProperties}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates theming via CSS variables. All colours, spacing, and visual properties can be customised.

\`\`\`css
.my-accordion {
  --lk-accordion-item-bg: white;
  --lk-accordion-item-border: grey;
  --lk-accordion-title-color: black;
  --lk-accordion-icon-bg: lightgrey;
}
\`\`\`
        `,
      },
    },
  },
};

export const DarkMode: Story = {
  name: 'Dark Mode',
  args: {
    items: itemsWithIcons,
    mode: 'single',
    collapsible: true,
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ background: 'rgb(17, 24, 39)', padding: '2rem', borderRadius: '0.5rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Add \`.dark\` class to container to enable dark mode tokens.

\`\`\`tsx
<div className="dark">
  <Accordion items={items} />
</div>
\`\`\`

Or rely on system preference (automatic via \`prefers-color-scheme\`).
        `,
      },
    },
  },
};

export const InteractionTest: Story = {
  args: {
    items: basicItems,
    mode: 'single',
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Automated interaction test using Storybook play function.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find first accordion item button
    const firstButton = canvas.getByRole('button', { name: /Getting Started/i });

    // Click to open
    await userEvent.click(firstButton);

    // Verify it opened (aria-expanded should be true)
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Find and click second item
    const secondButton = canvas.getByRole('button', { name: /Advanced Features/i });
    await userEvent.click(secondButton);

    // In single mode, first should close and second should open
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    await expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  },
};
