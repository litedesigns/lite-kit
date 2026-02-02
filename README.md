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

## Styling & Theming

lite-kit components use CSS variables for all themeable properties, following a three-tier token system (primitive → semantic → component). This allows complete visual customisation without fighting the library.

### Basic Usage

Import component styles:

```tsx
import { Accordion } from '@litedesigns/lite-kit';
import '@litedesigns/lite-kit/styles';
```

### Customisation via CSS Variables

Override any visual property:

```css
.my-accordion {
  --lk-accordion-item-bg: white;
  --lk-accordion-item-border: rgb(229, 231, 235);
  --lk-accordion-title-color: rgb(17, 24, 39);
}
```

### Customisation via Wrapper Classes

Target BEM classes directly:

```css
.my-accordion .lite-kit-accordion-item {
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### Dark Mode

Add `.dark` class to container or rely on system preference:

```tsx
<div className="dark">
  <Accordion items={items} />
</div>
```

See [Design Philosophy](./docs/DESIGN_PHILOSOPHY.md) for comprehensive styling guidelines.

## Development

### Component Development

```bash
npm run storybook  # Launch Storybook dev server at http://localhost:6006
```

View the live component library at: https://litedesigns.github.io/lite-kit

### Testing

```bash
npm test              # Run tests in watch mode
npm run test:ui       # Open Vitest UI
npm run test:run      # Run tests once (CI mode)
npm run test:coverage # Generate coverage report
```

### Building

```bash
npm install
npm run build
```

## Releasing a New Version

### Option 1: Local Release Script (Recommended)

```bash
# From the lite-kit directory
npm run release 1.1.0
```

This will:
1. Validate you're on main with no uncommitted changes
2. Install dependencies and build
3. Update package.json version
4. Commit, tag, and push

### Option 2: GitHub Actions

1. Go to [Actions](https://github.com/litedesigns/lite-kit/actions)
2. Select "Release" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., `1.1.0`)
5. Select release type (patch/minor/major)
6. Click "Run workflow"

### After Releasing

Update dependent projects:

```json
"@litedesigns/lite-kit": "github:litedesigns/lite-kit#v1.1.0"
```

Then run `npm install` in each project.

## Versioning

Follow [Semantic Versioning](https://semver.org/):
- **Patch** (1.0.x): Bug fixes, no API changes
- **Minor** (1.x.0): New features, backwards compatible
- **Major** (x.0.0): Breaking changes
