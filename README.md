# @litedesigns/lite-kit

Shared component library for LiteDesigns projects.

## Installation

```bash
npm install github:litedesigns/lite-kit#v1.0.0
```

## Components

### Accordion

A flexible accordion component supporting:
- **Single/Multiple modes** - Control whether one or many items can be open
- **Scroll detection** - Mac Gallery style auto-expansion based on scroll position
- **Theming** - Light, dark, or system-based themes
- **Icons and subtitles** - Rich item content

#### Basic Usage (FAQ style)

```tsx
import { Accordion } from '@litedesigns/lite-kit';
import '@litedesigns/lite-kit/styles';

const faqs = [
  { id: '1', title: 'Question 1?', content: 'Answer 1' },
  { id: '2', title: 'Question 2?', content: 'Answer 2' },
];

<Accordion
  items={faqs}
  mode="single"
  theme="light"
  defaultOpen="1"
/>
```

#### Scroll Detection (Mac Gallery style)

```tsx
import { Accordion } from '@litedesigns/lite-kit';
import { Heart, Coffee } from 'lucide-react';

const features = [
  { id: 'family', title: 'Family Run', subtitle: 'Heart in every cup', content: '...', icon: Heart },
  { id: 'coffee', title: 'Premium Coffee', subtitle: 'Expertly crafted', content: '...', icon: Coffee },
];

<Accordion
  items={features}
  variant="card"
  theme="dark"
  scrollDetect
  scrollConfig={{ hysteresis: 0.3, scrollToCenter: true }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | required | Array of accordion items |
| `mode` | `'single' \| 'multiple'` | `'single'` | Whether one or many items can be open |
| `defaultOpen` | `string \| string[]` | - | Item ID(s) to open by default |
| `collapsible` | `boolean` | `true` | Allow closing all items in single mode |
| `scrollDetect` | `boolean` | `false` | Enable scroll-based auto-expansion |
| `scrollConfig` | `ScrollConfig` | - | Scroll detection configuration |
| `variant` | `'default' \| 'card' \| 'minimal'` | `'default'` | Visual variant |
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | Theme preset |
| `className` | `string` | - | Container class names |
| `itemClassName` | `string` | - | Individual item class names |
| `onValueChange` | `(openIds: string[]) => void` | - | Callback when open items change |

### Theming

The component uses CSS variables for theming. Override in your CSS:

```css
.lite-kit-accordion {
  --accordion-bg: your-color;
  --accordion-border: your-color;
  --accordion-text: your-color;
  --accordion-text-muted: your-color;
}
```

## Development

```bash
npm install
npm run build
```

## Versioning

Use git tags for version control:
- `v1.0.0`, `v1.1.0`, `v2.0.0` (semver)
- Update in package.json: `"github:litedesigns/lite-kit#v1.1.0"`
- Run `npm install` to update
