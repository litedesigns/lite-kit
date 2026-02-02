# Design Philosophy & Architecture

**Version:** 2.0.0
**Last Updated:** 2026-02-02

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [CSS Architecture](#2-css-architecture)
3. [Component Anatomy](#3-component-anatomy)
4. [Build & Distribution](#4-build--distribution)
5. [Testing Strategy](#5-testing-strategy)
6. [Documentation Standards](#6-documentation-standards)
7. [Consumer Integration Guide](#7-consumer-integration-guide)
8. [Adding New Components](#8-adding-new-components---step-by-step)
9. [Design Decision Framework](#9-design-decision-framework)

---

## 1. Core Philosophy

### 1.1 The Lite-Kit Manifesto

**What makes lite-kit "lite":**

- **Zero runtime dependencies** (React as peer dependency only)
- **Functionality-first approach** (complex logic, simple design)
- **Modern CSS native** (no CSS-in-JS runtime overhead)
- **Small bundle size** (< 10kb gzipped per component)
- **No framework coupling** (works with Next.js, Vite, CRA, etc.)

**What makes lite-kit different:**

| Feature | lite-kit | shadcn/ui | radix-ui | Material-UI |
|---------|----------|-----------|----------|-------------|
| **Dependencies** | Zero (React only) | Copy to project | Headless primitives | Heavy (~300kb) |
| **Design** | Basic, customisable | Tailwind-based | Unstyled | Opinionated |
| **Complexity** | Specialised logic | General purpose | General purpose | Enterprise-scale |
| **Bundle Size** | ~10kb/component | Depends on copy | ~5-15kb | ~300kb+ |
| **Customisation** | CSS variables + BEM | Tailwind classes | Full control | Theme provider |

**Dependency discipline policy:**

Before adding ANY dependency:

1. Can we implement this ourselves? (If yes, do it)
2. What's the bundle size impact?
3. Is it actively maintained?
4. Does it have its own dependencies?
5. Does it provide unique value?

**Examples:**
- ❌ `classnames` library → Implement `cn()` utility (7 lines)
- ❌ `react-icons` → Inline SVG (zero dependency)
- ❌ `framer-motion` → CSS transitions (native)
- ✅ `react` → Core dependency, necessary

**Accessibility as non-negotiable baseline:**

- WCAG AA minimum (AAA where practical)
- Full keyboard navigation
- Screen reader support
- Focus management
- ARIA patterns (WAI-ARIA best practices)
- Automated testing (axe-core violations = test failure)

### 1.2 What Lite-Kit Is NOT

**Not a design system like Material-UI:**
- lite-kit provides functional components with basic design
- Consumers bring their own design language
- No theming provider, no design tokens out-of-the-box
- CSS variables allow any design system to be applied

**Not a replacement for shadcn/radix-ui:**
- lite-kit complements these libraries
- Use shadcn for general UI components
- Use lite-kit for specialised functionality (scroll detection, complex state)
- They work together seamlessly

**Not opinionated about visual design:**
- No enforced colour palettes, typography scales
- No "Material Design" or "Fluent" aesthetic
- Neutral base design that fades into background
- Consumers define the visual language

**Not bundling CSS frameworks:**
- Tailwind used internally for structure (dev-time)
- Consumers never see Tailwind dependency
- Final CSS is vanilla, framework-agnostic
- No PostCSS plugins required

### 1.3 Design Principles

#### 1. Zero Runtime Dependencies

**What this means:**
- Only `react` and `react-dom` as peer dependencies
- No `lodash`, `date-fns`, `classnames`, etc.
- Utilities implemented in-house
- Tree-shakeable exports

**Why this matters:**
- Smaller bundle sizes for consumers
- No version conflicts with consumer dependencies
- Faster installation
- Predictable behaviour

**Exceptions:**
- None. If functionality requires a dependency, reconsider if it belongs in lite-kit.

#### 2. Override Everything

**Every visual aspect must be customisable without fighting the library.**

**Anti-pattern (bad library design):**
```css
/* Library forces specificity wars */
.component .inner-element {
  background: blue !important;
  border: 1px solid blue !important;
}
```

**lite-kit pattern (good library design):**
```css
/* Library provides hooks for customisation */
.lite-kit-component {
  background: var(--lk-component-bg);
  border: 1px solid var(--lk-component-border);
}
```

**Consumer override is trivial:**
```css
.my-component {
  --lk-component-bg: white;
  --lk-component-border: grey;
}
```

**Three override strategies (in order of preference):**

1. **CSS Variables** (recommended for theming):
   ```css
   .my-accordion {
     --lk-accordion-item-bg: white;
   }
   ```

2. **Wrapper Classes** (recommended for complex styles):
   ```css
   .my-accordion .lite-kit-accordion-item {
     background: linear-gradient(...);
   }
   ```

3. **Direct Override** (global, use sparingly):
   ```css
   .lite-kit-accordion-item {
     /* Affects all instances */
   }
   ```

#### 3. Modern CSS Native

**Embrace modern CSS features, avoid JavaScript where CSS can do the job.**

**Use modern CSS for:**
- Custom properties (CSS variables)
- Container queries (responsive components)
- Cascade layers (predictable specificity)
- `:where()`/`:is()` (specificity control)
- Logical properties (internationalisation)
- `@property` (typed CSS variables)

**Example: Container queries over media queries**
```css
/* Traditional media query (context-unaware) */
@media (min-width: 768px) {
  .component { font-size: 1.25rem; }
}

/* Container query (context-aware) */
@container (min-width: 768px) {
  .component { font-size: 1.25rem; }
}
```

**Example: Cascade layers for predictable overrides**
```css
@layer base, components, utilities;

@layer base {
  .lite-kit-accordion-item { /* base styles */ }
}

@layer components {
  .my-accordion .lite-kit-accordion-item { /* overrides */ }
}
```

#### 4. Functionality Over Design

**lite-kit provides solid, functional base design. Consumers enhance.**

**What "base design" means:**
- Neutral colours (greys, whites, blacks)
- Standard spacing (8px grid)
- Clear hierarchy (typographic scale)
- Accessible contrast ratios
- Functional state indicators (hover, active, disabled)

**What "base design" is NOT:**
- Brand colours
- Custom fonts
- Illustrations, gradients
- Animations beyond functional transitions
- Personality or "vibe"

**Example: Accordion base vs consumer enhancement**

**Base (lite-kit provides):**
- Grey border, white background
- 16px padding
- Chevron icon
- Smooth transitions
- ARIA attributes

**Enhanced (consumer adds):**
- Glass morphism background
- Custom icons
- Brand colours
- Hover effects
- Box shadows

#### 5. Accessibility Non-Negotiable

**WCAG AA is the minimum. Every component must be fully accessible.**

**Keyboard navigation:**
- Tab: Focus management
- Enter/Space: Activation
- Arrow keys: Navigation (lists, menus, tabs)
- Escape: Close/cancel (modals, dropdowns)
- Home/End: First/last item

**ARIA patterns:**
- Follow WAI-ARIA best practices
- Use semantic HTML first
- Add ARIA when semantic HTML insufficient
- `aria-expanded`, `aria-controls`, `aria-labelledby`
- `aria-disabled` vs `disabled` attribute
- Live regions for dynamic content

**Focus management:**
- Visible focus indicators (2px outline minimum)
- Focus trap for modals
- Restore focus on close
- Skip links where appropriate

**Automated testing:**
- axe-core integration
- Zero violations = test pass
- Keyboard navigation tests
- Screen reader announcement tests

**Manual testing:**
- VoiceOver (macOS)
- NVDA (Windows)
- Tab through all interactive elements
- Verify screen reader announces correctly

#### 6. Composition Over Configuration

**Flexible, composable APIs over rigid configuration objects.**

**Anti-pattern (rigid configuration):**
```tsx
<Accordion
  config={{
    mode: 'single',
    collapsible: true,
    orientation: 'vertical',
    disabled: false,
    animated: true,
    animationDuration: 300,
    onValueChange: () => {},
  }}
/>
```

**lite-kit pattern (composable props):**
```tsx
<Accordion
  mode="single"
  defaultOpen="1"
  disabled={false}
  onChange={(value) => {}}
/>
```

**When to use compound components:**
- Consumers need layout flexibility
- Multiple rendering strategies exist
- 3+ sub-elements consumers might rearrange

**Example: Tabs (compound pattern justified)**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

## 2. CSS Architecture

### 2.1 The Three-Layer System

lite-kit uses a hybrid styling approach combining three layers:

#### Layer 1: Structural Classes (Tailwind - Dev-time Only)

**Purpose:** Layout, positioning, transitions, animations

**Examples:**
- `flex`, `items-center`, `justify-between`
- `gap-4`, `p-4`, `m-2`
- `transition-all`, `duration-300`
- `absolute`, `relative`, `sticky`

**Rules:**
- ✅ Used for positioning (flex, grid, absolute, relative)
- ✅ Used for spacing (p-*, m-*, gap-*)
- ✅ Used for transitions/animations
- ❌ NEVER used for colours, borders, backgrounds
- ✅ Shipped in dist but consumers never see Tailwind

**Why Tailwind internally:**
- Fast prototyping
- Consistent spacing scale
- Tree-shaking benefits
- No runtime cost (compiled to vanilla CSS)

**Important:** Tailwind is a build-time tool only. Consumers do not need Tailwind installed (though they can use it if they want).

#### Layer 2: Semantic BEM Classes (Customisation Hooks)

**Purpose:** Visual styling customisation points

**Pattern:** `.lite-kit-{component}-{element}[--modifier]`

**Examples:**
- `.lite-kit-accordion-item` (block)
- `.lite-kit-accordion-title` (element)
- `.lite-kit-accordion-item--open` (modifier - state)
- `.lite-kit-accordion-item--card` (modifier - variant)

**Rules:**
- Every visual element gets a BEM class
- States get modifiers: `--open`, `--active`, `--disabled`
- Variants get modifiers: `--card`, `--minimal`, `--compact`
- NO Tailwind `@apply` in production CSS
- Classes are customisation hooks, not implementation details

**BEM naming convention:**

```
.lite-kit-{component}-{element}[--modifier]
         └─ namespace  └─ block    └─ element  └─ state/variant
```

**Example structure:**
```tsx
<div className="lite-kit-accordion-item lite-kit-accordion-item--open">
  <button className="lite-kit-accordion-trigger">
    <div className="lite-kit-accordion-icon lite-kit-accordion-icon--active">
      {icon}
    </div>
    <div className="lite-kit-accordion-text">
      <h3 className="lite-kit-accordion-title">Title</h3>
      <p className="lite-kit-accordion-subtitle">Subtitle</p>
    </div>
    <svg className="lite-kit-accordion-chevron" />
  </button>
  <div className="lite-kit-accordion-content">
    <div className="lite-kit-accordion-content-inner">
      {children}
    </div>
  </div>
</div>
```

#### Layer 3: CSS Variables (Design Tokens)

**Purpose:** Themeable values consumers override

**Prefix:** `--lk-` (lite-kit namespace)

**Hierarchy:** Primitive → Semantic → Component

**Examples:**
- Primitive: `--lk-gray-500: 107, 114, 128;`
- Semantic: `--lk-color-text-primary: rgb(var(--lk-gray-900));`
- Component: `--lk-accordion-title-color: var(--lk-color-text-primary);`

**RGB format for alpha support:**
```css
/* Define as RGB triplet */
--lk-gray-500: 107, 114, 128;

/* Use with alpha */
background: rgba(var(--lk-gray-500), 0.5);

/* Use without alpha */
color: rgb(var(--lk-gray-500));
```

### 2.2 Token Hierarchy

#### Primitive Tokens (Foundation)

Raw design values. Never reference these directly in components.

```css
:root {
  /* Colours (RGB for alpha support) */
  --lk-white: 255, 255, 255;
  --lk-black: 0, 0, 0;

  --lk-gray-50: 249, 250, 251;
  --lk-gray-100: 243, 244, 246;
  --lk-gray-200: 229, 231, 235;
  --lk-gray-300: 209, 213, 219;
  --lk-gray-400: 156, 163, 175;
  --lk-gray-500: 107, 114, 128;
  --lk-gray-600: 75, 85, 99;
  --lk-gray-700: 55, 65, 81;
  --lk-gray-800: 31, 41, 55;
  --lk-gray-900: 17, 24, 39;

  /* Spacing (8px base grid) */
  --lk-space-1: 0.25rem;   /* 4px */
  --lk-space-2: 0.5rem;    /* 8px */
  --lk-space-3: 0.75rem;   /* 12px */
  --lk-space-4: 1rem;      /* 16px */
  --lk-space-5: 1.25rem;   /* 20px */
  --lk-space-6: 1.5rem;    /* 24px */
  --lk-space-8: 2rem;      /* 32px */
  --lk-space-10: 2.5rem;   /* 40px */
  --lk-space-12: 3rem;     /* 48px */

  /* Border radii */
  --lk-radius-sm: 0.25rem;  /* 4px */
  --lk-radius-md: 0.5rem;   /* 8px */
  --lk-radius-lg: 0.75rem;  /* 12px */
  --lk-radius-xl: 1rem;     /* 16px */
  --lk-radius-full: 9999px;

  /* Shadows */
  --lk-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --lk-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --lk-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --lk-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --lk-transition-fast: 150ms;
  --lk-transition-base: 300ms;
  --lk-transition-slow: 500ms;

  /* Z-index scale */
  --lk-z-base: 0;
  --lk-z-dropdown: 1000;
  --lk-z-modal: 2000;
  --lk-z-toast: 3000;
}
```

#### Semantic Tokens (Meaning)

Give meaning to primitives. Components reference these.

```css
:root {
  /* Text colours */
  --lk-color-text-primary: rgb(var(--lk-gray-900));
  --lk-color-text-secondary: rgb(var(--lk-gray-500));
  --lk-color-text-tertiary: rgb(var(--lk-gray-400));
  --lk-color-text-disabled: rgb(var(--lk-gray-300));
  --lk-color-text-inverse: rgb(var(--lk-white));

  /* Border colours */
  --lk-color-border-base: rgb(var(--lk-gray-200));
  --lk-color-border-hover: rgb(var(--lk-gray-300));
  --lk-color-border-focus: rgb(var(--lk-gray-400));
  --lk-color-border-disabled: rgb(var(--lk-gray-200));

  /* Background colours */
  --lk-color-bg-base: rgb(var(--lk-white));
  --lk-color-bg-subtle: rgb(var(--lk-gray-50));
  --lk-color-bg-muted: rgb(var(--lk-gray-100));
  --lk-color-bg-hover: rgb(var(--lk-gray-50));
  --lk-color-bg-active: rgb(var(--lk-gray-100));
  --lk-color-bg-disabled: rgb(var(--lk-gray-100));

  /* State colours */
  --lk-color-success: rgb(34, 197, 94);
  --lk-color-error: rgb(239, 68, 68);
  --lk-color-warning: rgb(251, 191, 36);
  --lk-color-info: rgb(59, 130, 246);
}
```

#### Component Tokens (Specific)

Component-specific tokens. Consumers override these for theming.

```css
:root {
  /* Accordion */
  --lk-accordion-item-bg: transparent;
  --lk-accordion-item-border: var(--lk-color-border-base);
  --lk-accordion-item-border-hover: var(--lk-color-border-hover);
  --lk-accordion-item-radius: var(--lk-radius-md);
  --lk-accordion-item-padding: var(--lk-space-4);
  --lk-accordion-item-gap: var(--lk-space-2);
  --lk-accordion-item-shadow: none;
  --lk-accordion-item-shadow-hover: var(--lk-shadow-sm);

  --lk-accordion-icon-size: 3rem;
  --lk-accordion-icon-bg: var(--lk-color-bg-subtle);
  --lk-accordion-icon-bg-active: var(--lk-color-bg-muted);
  --lk-accordion-icon-color: var(--lk-color-text-secondary);
  --lk-accordion-icon-color-active: var(--lk-color-text-primary);
  --lk-accordion-icon-radius: var(--lk-radius-lg);

  --lk-accordion-title-color: var(--lk-color-text-primary);
  --lk-accordion-title-weight: 500;
  --lk-accordion-subtitle-color: var(--lk-color-text-secondary);
  --lk-accordion-subtitle-color-active: var(--lk-color-text-primary);
  --lk-accordion-content-color: var(--lk-color-text-primary);

  --lk-accordion-chevron-color: var(--lk-color-text-secondary);
  --lk-accordion-chevron-size: 1.25rem;

  --lk-accordion-transition-duration: var(--lk-transition-base);
}
```

### 2.3 Dark Mode Strategy

lite-kit uses a hybrid dark mode approach supporting:
1. Class-based (`.dark`)
2. Data attribute (`data-theme="dark"`)
3. System preference (`prefers-color-scheme`)

```css
:root {
  /* Light mode (default) */
  --lk-color-text-primary: rgb(17, 24, 39);
  --lk-color-bg-base: rgb(255, 255, 255);
}

/* Class-based dark mode */
.dark,
:root[data-theme="dark"] {
  --lk-color-text-primary: rgb(255, 255, 255);
  --lk-color-bg-base: rgb(17, 24, 39);
}

/* System preference dark mode */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --lk-color-text-primary: rgb(255, 255, 255);
    --lk-color-bg-base: rgb(17, 24, 39);
  }
}
```

**Consumer usage:**

```tsx
// Option 1: Class-based
<div className="dark">
  <Accordion items={items} />
</div>

// Option 2: Data attribute
<div data-theme="dark">
  <Accordion items={items} />
</div>

// Option 3: System preference (automatic)
// Component respects prefers-color-scheme by default
```

**Dark mode token strategy:**

Flip the greyscale for dark mode:

```css
:root {
  --lk-gray-50: 249, 250, 251;   /* Lightest */
  --lk-gray-900: 17, 24, 39;     /* Darkest */
}

.dark {
  --lk-gray-50: 31, 41, 55;      /* Now dark */
  --lk-gray-900: 255, 255, 255;  /* Now light */
}
```

Semantic tokens automatically adapt:

```css
:root {
  --lk-color-text-primary: rgb(var(--lk-gray-900));
  /* Light mode: black text on white */
  /* Dark mode: white text on black (automatic) */
}
```

### 2.4 Override Strategies

Consumers have three ways to customise lite-kit components. Choose based on use case.

#### Strategy A: CSS Variables (Recommended for Theming)

**Best for:**
- Consistent theming across entire app
- Simple value overrides (colours, spacing, sizes)
- Dark mode support
- Multiple theme variants

**Example:**
```css
/* Global theme */
:root {
  --lk-accordion-item-bg: white;
  --lk-accordion-item-border: #e5e7eb;
  --lk-accordion-title-color: #111827;
}

.dark {
  --lk-accordion-item-bg: rgba(0, 0, 0, 0.5);
  --lk-accordion-item-border: rgba(255, 255, 255, 0.1);
  --lk-accordion-title-color: white;
}
```

**Pros:**
- ✅ Clean, maintainable
- ✅ Works with any specificity
- ✅ Easy to swap themes
- ✅ No selector complexity

**Cons:**
- ❌ Limited to simple values
- ❌ Can't add new properties (e.g., `backdrop-filter`)

#### Strategy B: Wrapper Classes (Recommended for Complex Styles)

**Best for:**
- Component-specific customisation
- Complex CSS (gradients, filters, animations)
- Adding new properties
- One-off overrides

**Example:**
```css
/* Infinity glass morphism example */
.infinity-accordion .lite-kit-accordion-item {
  background: linear-gradient(
    to bottom right,
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0.5)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.infinity-accordion .lite-kit-accordion-title {
  color: rgb(255, 255, 255);
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
```

**Pros:**
- ✅ Full CSS control
- ✅ Can add new properties
- ✅ Complex effects (gradients, filters)
- ✅ Scoped to wrapper

**Cons:**
- ❌ Requires specific selectors
- ❌ More verbose
- ❌ Can conflict with library updates

#### Strategy C: Direct Override (Use Sparingly)

**Best for:**
- Global changes affecting all instances
- Quick prototyping
- Debugging

**Example:**
```css
/* Affects ALL accordions in the app */
.lite-kit-accordion-item {
  background: white;
  border: 1px solid #e5e7eb;
}
```

**Pros:**
- ✅ Simple, global
- ✅ Affects all instances

**Cons:**
- ❌ No scoping
- ❌ Hard to maintain
- ❌ Unexpected side effects

#### Hybrid Approach (Recommended)

Combine strategies for best results:

```css
/* Use CSS variables for themeable values */
.my-accordion {
  --lk-accordion-item-border: rgba(255, 255, 255, 0.1);
  --lk-accordion-title-color: rgb(255, 255, 255);
}

/* Use wrapper classes for complex effects */
.my-accordion .lite-kit-accordion-item {
  background: linear-gradient(...);
  backdrop-filter: blur(8px);
}
```

### 2.5 Modern CSS Features

lite-kit leverages modern CSS features for better developer experience and smaller bundle sizes.

#### Container Queries

Use container queries for responsive components without media queries.

```css
/* Component adapts to its container, not viewport */
.lite-kit-accordion-item {
  container-type: inline-size;
  container-name: accordion-item;
}

@container accordion-item (min-width: 768px) {
  .lite-kit-accordion-title {
    font-size: 1.25rem;
  }
}
```

**When to use:**
- Components used in sidebars, cards, modals
- Layout flexibility (component size varies)
- Better than media queries for reusable components

#### Cascade Layers

Use cascade layers for predictable override hierarchy.

```css
@layer base, components, utilities;

@layer base {
  .lite-kit-accordion-item {
    background: white;
  }
}

@layer components {
  /* Consumer overrides here */
}
```

**When to use:**
- Managing specificity conflicts
- Creating predictable override patterns
- Large-scale design systems

#### Custom Properties with Type Hints

Use `@property` for typed CSS variables (browser support pending).

```css
@property --lk-accordion-item-bg {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
```

**When to use:**
- Animating CSS variables
- Type safety in CSS
- Better developer tooling

#### :where() for Specificity Control

Use `:where()` to reduce specificity and make overrides easier.

```css
/* High specificity (hard to override) */
.lite-kit-accordion-item .lite-kit-accordion-title {
  color: black;
}

/* Zero specificity (easy to override) */
:where(.lite-kit-accordion-item) :where(.lite-kit-accordion-title) {
  color: black;
}
```

**When to use:**
- Library base styles (make overrides easier)
- Avoiding specificity wars

#### Logical Properties

Use logical properties for internationalisation (RTL support).

```css
/* Physical (LTR only) */
.component {
  margin-left: 1rem;
  padding-right: 1rem;
}

/* Logical (LTR + RTL) */
.component {
  margin-inline-start: 1rem;
  padding-inline-end: 1rem;
}
```

**When to use:**
- Components that might be used in RTL languages
- Spacing, positioning, borders

---

## 3. Component Anatomy

### 3.1 File Structure Template

Every component follows this standard structure:

```
component-name/
├── ComponentName.tsx           # Main component (default export)
├── types.ts                    # TypeScript interfaces
├── ComponentName.test.tsx      # Vitest unit tests
├── ComponentName.stories.tsx   # Storybook stories
└── styles.css                  # Component CSS (optional, prefer central styles)
```

**Example: Accordion**
```
accordion/
├── Accordion.tsx
├── types.ts
├── Accordion.test.tsx
└── Accordion.stories.tsx
```

**Central styles approach:**
```
src/styles/
├── index.css       # Main import (consumers use this)
├── tokens.css      # Design tokens
├── accordion.css   # Accordion component styles
└── tabs.css        # Tabs component styles
```

### 3.2 TypeScript Patterns

#### Standard Props Interface

```typescript
export interface ComponentProps {
  // --------------------------------------------------
  // Data (required props first)
  // --------------------------------------------------
  /** Array of items to render */
  items: ComponentItem[];

  // --------------------------------------------------
  // Behaviour (optional props)
  // --------------------------------------------------
  /** Controls single vs multiple item expansion */
  mode?: 'single' | 'multiple';

  /** Default open item(s) */
  defaultValue?: string | string[];

  /** Disable all interactions */
  disabled?: boolean;

  // --------------------------------------------------
  // Appearance
  // --------------------------------------------------
  /** Visual variant */
  variant?: 'default' | 'card' | 'minimal';

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  // --------------------------------------------------
  // Styling (always include)
  // --------------------------------------------------
  /** Class name for root element */
  className?: string;

  /** Class name for item elements */
  itemClassName?: string;

  /** Class name for content wrapper */
  contentClassName?: string;

  // --------------------------------------------------
  // Callbacks
  // --------------------------------------------------
  /** Called when value changes */
  onChange?: (value: string | string[]) => void;

  /** Called when item is toggled */
  onToggle?: (itemId: string, isOpen: boolean) => void;

  // --------------------------------------------------
  // Advanced features (optional)
  // --------------------------------------------------
  /** Enable scroll-based auto-expansion */
  scrollDetect?: boolean;

  /** Custom configuration object */
  customConfig?: CustomConfig;
}
```

#### Item Interface Pattern

```typescript
export interface ComponentItem {
  /** Unique identifier */
  id: string;

  /** Display title */
  title: string;

  /** Optional subtitle */
  subtitle?: string;

  /** Content to render */
  content: ReactNode;

  /** Optional icon */
  icon?: ReactNode;

  /** Disable this specific item */
  disabled?: boolean;
}
```

#### Props API Principles

1. **Sensible defaults** (most common use case)
   ```typescript
   mode?: 'single' | 'multiple';  // Defaults to 'single'
   ```

2. **Boolean for on/off, string union for variations**
   ```typescript
   disabled?: boolean;           // On/off
   variant?: 'default' | 'card'; // Variations
   ```

3. **Optional chaining for complex config**
   ```typescript
   config?: {
     animationDuration?: number;
     scrollOffset?: number;
   };
   ```

4. **Callback naming conventions**
   ```typescript
   onChange?: (value: T) => void;        // Value changed
   onToggle?: (id: string) => void;      // State toggled
   onValueChange?: (value: T) => void;   // Alias for onChange
   ```

5. **Controlled vs uncontrolled**
   ```typescript
   // Uncontrolled (component manages state)
   defaultValue?: string;

   // Controlled (consumer manages state)
   value?: string;
   onChange?: (value: string) => void;
   ```

### 3.3 Accessibility Requirements

Every component must meet these non-negotiable accessibility requirements.

#### Keyboard Navigation

| Key | Action | Example Components |
|-----|--------|-------------------|
| **Tab** | Focus next element | All interactive components |
| **Shift+Tab** | Focus previous element | All interactive components |
| **Enter** | Activate element | Buttons, links, accordion triggers |
| **Space** | Activate element | Buttons, checkboxes |
| **Arrow Up/Down** | Navigate list | Select, menu, listbox |
| **Arrow Left/Right** | Navigate tabs | Tabs, slider |
| **Escape** | Close/cancel | Modal, dropdown, dialog |
| **Home** | First item | Lists, menus |
| **End** | Last item | Lists, menus |

#### ARIA Attributes

**Semantic HTML first:**
```tsx
// ✅ Good: Semantic HTML
<button onClick={toggle}>Toggle</button>

// ❌ Bad: div with onClick
<div onClick={toggle}>Toggle</div>
```

**ARIA when semantic HTML insufficient:**
```tsx
// ✅ Good: ARIA enhancing semantic HTML
<button
  onClick={toggle}
  aria-expanded={isOpen}
  aria-controls="content-1"
>
  Toggle
</button>

<div id="content-1" role="region" aria-labelledby="trigger-1">
  Content
</div>
```

**Common ARIA patterns:**
```tsx
// Accordion
<button
  aria-expanded={isOpen}
  aria-controls="content-id"
  aria-disabled={disabled}
>

// Tabs
<div role="tablist">
  <button role="tab" aria-selected={isActive} aria-controls="panel-id">
  </button>
</div>
<div role="tabpanel" id="panel-id" aria-labelledby="tab-id">
</div>

// Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>

// Live regions (dynamic content)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

#### Focus Management

**Visible focus indicators:**
```css
.lite-kit-component:focus-visible {
  outline: 2px solid var(--lk-color-border-focus);
  outline-offset: 2px;
}

/* Remove default outline, add custom */
.lite-kit-component:focus {
  outline: none;
}

.lite-kit-component:focus-visible {
  /* Custom focus style */
}
```

**Focus trap for modals:**
```typescript
import { useEffect, useRef } from 'react';

function Modal({ isOpen }: { isOpen: boolean }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return <div ref={modalRef} role="dialog" aria-modal="true">...</div>;
}
```

**Restore focus on close:**
```typescript
function Component() {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setIsOpen(false);
    // Restore focus to trigger
    triggerRef.current?.focus();
  };

  return (
    <>
      <button ref={triggerRef} onClick={() => setIsOpen(true)}>
        Open
      </button>
      {isOpen && <Modal onClose={handleClose} />}
    </>
  );
}
```

#### Testing Requirements

**axe-core integration:**
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Component accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Keyboard navigation tests:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Keyboard navigation', () => {
  it('opens on Enter key', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    const trigger = screen.getByRole('button', { name: /item 1/i });
    await user.click(trigger);
    await user.keyboard('{Enter}');

    expect(screen.getByText(/content 1/i)).toBeInTheDocument();
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);

    const firstTab = screen.getByRole('tab', { name: /tab 1/i });
    firstTab.focus();

    await user.keyboard('{ArrowRight}');

    const secondTab = screen.getByRole('tab', { name: /tab 2/i });
    expect(secondTab).toHaveFocus();
  });
});
```

**Screen reader announcement tests:**
```typescript
it('announces state changes', async () => {
  const user = userEvent.setup();
  render(<Component />);

  const trigger = screen.getByRole('button');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});
```

### 3.4 Component Composition Pattern

**Decision tree: Simple vs Compound API**

```
                    Start here
                        ↓
            Does consumer need layout control?
                    /     \
                  NO       YES
                  ↓         ↓
        Use Simple API    Are there 3+ sub-elements?
                              /     \
                            NO       YES
                            ↓         ↓
                    Use Simple API   Use Compound API
```

#### Simple API (Default - Start Here)

**Best for:**
- Linear data structures (lists, accordions)
- Single rendering strategy
- Limited customisation points

**Example: Accordion (simple API)**
```tsx
<Accordion
  items={items}
  mode="single"
  defaultOpen="1"
  onChange={(value) => console.log(value)}
/>
```

**Implementation pattern:**
```typescript
interface SimpleComponentProps {
  items: Item[];
  mode?: 'single' | 'multiple';
  defaultOpen?: string;
  onChange?: (value: string) => void;
}

export function SimpleComponent({ items, mode = 'single', ...props }: SimpleComponentProps) {
  return (
    <div className="lite-kit-component">
      {items.map((item) => (
        <div key={item.id} className="lite-kit-component-item">
          {/* Render item */}
        </div>
      ))}
    </div>
  );
}
```

#### Compound API (Only If Needed)

**Best for:**
- Consumers need layout flexibility
- Multiple rendering strategies
- 3+ sub-elements consumers might rearrange

**Example: Tabs (compound API justified)**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

**Why compound pattern here:**
- Consumer might want vertical tabs (TabsList on left)
- Consumer might want tabs without content panel
- Consumer might want custom trigger layout
- 4 sub-elements (Tabs, TabsList, TabsTrigger, TabsContent)

**Implementation pattern (Context API):**
```typescript
interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ children, defaultValue }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className="lite-kit-tabs">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  return (
    <button
      role="tab"
      aria-selected={context.value === value}
      onClick={() => context.onChange(value)}
    >
      {children}
    </button>
  );
}
```

**Rule of thumb:** Start with simple API. Only introduce compound pattern when simple API becomes limiting. Most components should use simple API.

---

## 4. Build & Distribution

### 4.1 Build Configuration (tsup)

lite-kit uses `tsup` for building. Configuration rationale:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],

  // Output formats
  format: ['cjs', 'esm'],        // ✅ Both formats for compatibility

  // TypeScript
  dts: true,                      // ✅ Generate .d.ts files
  splitting: false,               // ❌ Single bundle (small library)
  sourcemap: true,                // ✅ Debugging support

  // Dependencies
  external: ['react', 'react-dom'], // ✅ Peer dependencies

  // CSS
  injectStyle: false,             // ❌ CSS separate import

  // Minification
  minify: false,                  // ❌ Readable for GitHub installs

  // Cleaning
  clean: true,                    // ✅ Clean dist before build
});
```

#### Why These Choices

**CJS + ESM formats:**
- ESM: Next.js 13+ (App Router), Vite, modern tools
- CJS: Older Next.js (Pages Router), webpack 4, legacy tools
- Both formats ensure maximum compatibility

**No code splitting:**
- lite-kit is small (< 50kb total)
- Single file is simpler for GitHub installs
- Consumers can tree-shake if they want

**No minification:**
- GitHub installs ship `dist/` directly
- Readable code is better for debugging
- Consumers minify in their own build
- Adds ~2-3kb (negligible)

**External React:**
- React is peer dependency (consumers provide)
- Avoids bundling React (huge size savings)
- Prevents React version conflicts

**Separate CSS import:**
- Consumers control when CSS loads
- Better for SSR (avoid flash of unstyled content)
- Easier to inspect/override
- Pattern: `import '@litedesigns/lite-kit/styles';`

### 4.2 Package Structure

**package.json exports strategy:**

```json
{
  "name": "@litedesigns/lite-kit",
  "version": "2.0.0",
  "type": "module",

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./styles": "./src/styles/index.css",
    "./package.json": "./package.json"
  },

  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",

  "files": [
    "dist",
    "src/styles"
  ],

  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },

  "sideEffects": false
}
```

#### Export Paths Explained

**`.` (main export):**
```typescript
import { Accordion } from '@litedesigns/lite-kit';
```
Resolves to:
- TypeScript: `./dist/index.d.ts`
- ESM: `./dist/index.mjs`
- CJS: `./dist/index.js`

**`./styles` (CSS export):**
```typescript
import '@litedesigns/lite-kit/styles';
```
Resolves to: `./src/styles/index.css`

**`./package.json` (metadata):**
```typescript
import pkg from '@litedesigns/lite-kit/package.json';
```
Useful for version checks, debugging.

#### Files Included in npm Package

**`dist/`** - Compiled JavaScript + TypeScript declarations
- `index.js` (CJS)
- `index.mjs` (ESM)
- `index.d.ts` (TypeScript types)
- `index.js.map` (sourcemap)

**`src/styles/`** - Raw CSS files
- `index.css` (main import)
- `tokens.css` (design tokens)
- `accordion.css` (component styles)

**Why commit dist/?**
- GitHub installs need pre-built code
- npm packages include dist automatically
- Avoids "build on install" complexity

#### Side Effects Declaration

```json
"sideEffects": false
```

Tells bundlers (webpack, rollup, vite) that:
- No files have side effects when imported
- Safe to tree-shake unused exports
- Reduces consumer bundle size

**Example: If consumer only imports Accordion:**
```typescript
import { Accordion } from '@litedesigns/lite-kit';
// Tree-shaking removes Tabs, Modal, etc.
```

### 4.3 CSS Distribution

**Current approach:** Separate CSS per component, central import.

```
src/styles/
├── index.css       # Main import (consumers use this)
├── tokens.css      # Shared design tokens
├── accordion.css   # Accordion component styles
└── tabs.css        # Tabs component styles
```

**Consumer imports:**
```typescript
// Import all component styles
import '@litedesigns/lite-kit/styles';

// Or import specific component (future enhancement)
import '@litedesigns/lite-kit/styles/accordion';
```

**Build process:**
1. `tsup` compiles TypeScript → JavaScript
2. CSS files remain untouched (raw CSS shipped)
3. Consumer's build tool processes CSS (PostCSS, etc.)

**Why not CSS-in-JS:**
- ❌ Runtime overhead (JS parses CSS at runtime)
- ❌ Larger bundle size
- ❌ Flash of unstyled content (SSR)
- ✅ Vanilla CSS is faster, smaller, simpler

**Why not inline styles:**
- ❌ Can't use pseudo-classes (`:hover`, `:focus`)
- ❌ Can't use media queries
- ❌ No CSS variables
- ❌ Higher specificity

---

## 5. Testing Strategy

### 5.1 Testing Pyramid

lite-kit follows the testing pyramid with different coverage targets per layer.

```
         /\
        /E2E\              1-2 tests per component
       /------\            (Playwright, in consumer projects)
      /  Inte- \
     /   gration\          10-15 tests per component
    /-------------\        (Vitest + Testing Library)
   /               \
  /   Unit Tests     \     20-30 tests per component
 /____________________\    (Vitest)
```

#### Unit Tests (Vitest) - 20-30 tests

**Coverage target:** >80% line coverage

**What to test:**
- Props variations
- State management
- Utility functions
- Edge cases
- TypeScript types

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { Accordion } from './Accordion';

describe('Accordion - Unit Tests', () => {
  const items = [
    { id: '1', title: 'Item 1', content: 'Content 1' },
    { id: '2', title: 'Item 2', content: 'Content 2' },
  ];

  it('renders all items', () => {
    render(<Accordion items={items} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Accordion items={items} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('disables component when disabled prop is true', () => {
    render(<Accordion items={items} disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('handles empty items array', () => {
    const { container } = render(<Accordion items={[]} />);
    expect(container.querySelector('.lite-kit-accordion-item')).not.toBeInTheDocument();
  });
});
```

#### Integration Tests - 10-15 tests

**What to test:**
- User interactions (click, keyboard, focus)
- State updates across component parts
- Callback invocations
- Complex user flows

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';

describe('Accordion - Integration Tests', () => {
  const items = [
    { id: '1', title: 'Item 1', content: 'Content 1' },
    { id: '2', title: 'Item 2', content: 'Content 2' },
  ];

  it('opens item on click and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /item 1/i });
    await user.click(trigger);

    expect(screen.getByText('Content 1')).toBeVisible();
    expect(onChange).toHaveBeenCalledWith('1');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports single mode (closes other items)', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} mode="single" />);

    // Open first item
    await user.click(screen.getByRole('button', { name: /item 1/i }));
    expect(screen.getByText('Content 1')).toBeVisible();

    // Open second item (should close first)
    await user.click(screen.getByRole('button', { name: /item 2/i }));
    expect(screen.queryByText('Content 1')).not.toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('supports multiple mode (keeps items open)', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} mode="multiple" />);

    // Open both items
    await user.click(screen.getByRole('button', { name: /item 1/i }));
    await user.click(screen.getByRole('button', { name: /item 2/i }));

    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });
});
```

#### Accessibility Tests - Every component

**Coverage target:** Zero axe violations

**What to test:**
- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader announcements

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Accordion } from './Accordion';

expect.extend(toHaveNoViolations);

describe('Accordion - Accessibility', () => {
  const items = [
    { id: '1', title: 'Item 1', content: 'Content 1' },
    { id: '2', title: 'Item 2', content: 'Content 2' },
  ];

  it('has no accessibility violations', async () => {
    const { container } = render(<Accordion items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation (Enter)', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    const trigger = screen.getByRole('button', { name: /item 1/i });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('supports keyboard navigation (Space)', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    const trigger = screen.getByRole('button', { name: /item 1/i });
    trigger.focus();
    await user.keyboard(' ');

    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('has correct ARIA attributes', () => {
    render(<Accordion items={items} defaultOpen="1" />);

    const trigger = screen.getByRole('button', { name: /item 1/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');

    const content = screen.getByText('Content 1').closest('[role="region"]');
    expect(content).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
  });

  it('maintains focus after interaction', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    const trigger = screen.getByRole('button', { name: /item 1/i });
    await user.click(trigger);

    expect(trigger).toHaveFocus();
  });
});
```

#### E2E Tests (Consumer Projects) - 1-2 tests

**Responsibility:** Consumer projects (Infinity, Zest)

**What to test:**
- Component works in production build
- Component works with consumer's styling
- Component works in complex page layouts

**Example (Playwright in Infinity):**
```typescript
import { test, expect } from '@playwright/test';

test('Accordion works in production', async ({ page }) => {
  await page.goto('/features');

  // Component renders
  await expect(page.locator('.lite-kit-accordion-item')).toHaveCount(3);

  // Interaction works
  await page.click('text=Feature 1');
  await expect(page.locator('text=Feature 1 description')).toBeVisible();

  // Styling applied correctly
  const item = page.locator('.lite-kit-accordion-item').first();
  await expect(item).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.7)'); // Glass morphism
});
```

### 5.2 Running Tests

**Watch mode (development):**
```bash
npm test
```

**Single run (CI):**
```bash
npm run test:ci
```

**Coverage report:**
```bash
npm run test:coverage
```

**UI mode:**
```bash
npm run test:ui
```

### 5.3 Coverage Targets

| Test Type | Coverage Target | Enforcement |
|-----------|----------------|-------------|
| **Unit** | >80% lines | CI fails below 80% |
| **Integration** | All user flows | Manual review |
| **Accessibility** | Zero axe violations | CI fails on violations |
| **E2E** | Critical paths | Consumer responsibility |

**Vitest configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,           // 80% line coverage required
      branches: 75,        // 75% branch coverage required
      functions: 80,       // 80% function coverage required
      statements: 80,      // 80% statement coverage required
    },
  },
});
```

---

## 6. Documentation Standards

### 6.1 Component JSDoc

Every component must have comprehensive JSDoc comments.

#### Component-level JSDoc

```typescript
/**
 * Accordion component with optional scroll-based auto-expansion.
 *
 * Provides a flexible, accessible accordion with single or multiple
 * item expansion modes. Supports keyboard navigation, custom styling,
 * and optional scroll detection for automatic expansion.
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Accordion
 *   items={items}
 *   mode="single"
 *   defaultOpen="1"
 * />
 * ```
 *
 * @example
 * With scroll detection:
 * ```tsx
 * <Accordion
 *   items={items}
 *   scrollDetect
 *   scrollOffset={100}
 * />
 * ```
 *
 * @example
 * Custom styling:
 * ```tsx
 * <Accordion
 *   items={items}
 *   className="my-accordion"
 *   itemClassName="my-item"
 * />
 * ```
 *
 * @see {@link https://litedesigns.github.io/lite-kit/?path=/docs/accordion--docs | Storybook Docs}
 * @see {@link https://github.com/litedesigns/lite-kit/blob/main/docs/DESIGN_PHILOSOPHY.md | Design Philosophy}
 */
export function Accordion({ ... }: AccordionProps) {
  // ...
}
```

#### Interface-level JSDoc

```typescript
/**
 * Props for the Accordion component.
 */
export interface AccordionProps {
  /**
   * Array of items to render in the accordion.
   *
   * Each item must have a unique `id`, `title`, and `content`.
   * Optional `subtitle` and `icon` can enhance the display.
   */
  items: AccordionItem[];

  /**
   * Controls whether single or multiple items can be open simultaneously.
   *
   * - `'single'`: Only one item open at a time (default)
   * - `'multiple'`: Multiple items can be open
   *
   * @default 'single'
   */
  mode?: 'single' | 'multiple';

  /**
   * ID(s) of item(s) to open by default.
   *
   * For `mode="single"`, pass a single string.
   * For `mode="multiple"`, pass an array of strings.
   *
   * @example
   * Single mode: `defaultOpen="1"`
   * Multiple mode: `defaultOpen={["1", "2"]}`
   */
  defaultOpen?: string | string[];

  /**
   * Enable scroll-based auto-expansion.
   *
   * When an accordion item scrolls into view, it automatically opens.
   * Uses Intersection Observer API for efficient detection.
   *
   * @default false
   */
  scrollDetect?: boolean;

  /**
   * Scroll offset for triggering expansion (pixels from top).
   *
   * Only applies when `scrollDetect` is enabled.
   *
   * @default 100
   */
  scrollOffset?: number;

  /**
   * Disable all interactions.
   *
   * When true, items cannot be opened/closed. Useful for loading states.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom class name for the root element.
   *
   * Applied to the outermost `<div>` wrapper.
   */
  className?: string;

  /**
   * Custom class name for each item element.
   *
   * Applied to each `.lite-kit-accordion-item` element.
   */
  itemClassName?: string;

  /**
   * Callback fired when the open items change.
   *
   * For `mode="single"`, receives the open item ID or empty string.
   * For `mode="multiple"`, receives an array of open item IDs.
   *
   * @param value - Current open item(s)
   *
   * @example
   * ```tsx
   * <Accordion
   *   items={items}
   *   onChange={(value) => console.log('Open items:', value)}
   * />
   * ```
   */
  onChange?: (value: string | string[]) => void;
}
```

#### Item Interface JSDoc

```typescript
/**
 * Individual item in the Accordion.
 */
export interface AccordionItem {
  /**
   * Unique identifier for the item.
   *
   * Used for `defaultOpen`, `onChange` callbacks, and internal state management.
   */
  id: string;

  /**
   * Title displayed in the accordion header.
   *
   * Rendered prominently; acts as the primary label.
   */
  title: string;

  /**
   * Optional subtitle displayed below the title.
   *
   * Provides additional context or description.
   */
  subtitle?: string;

  /**
   * Content displayed when the item is expanded.
   *
   * Can be any React node: text, JSX, components.
   *
   * @example
   * ```tsx
   * content: <div>Custom JSX content</div>
   * ```
   */
  content: ReactNode;

  /**
   * Optional icon displayed to the left of the title.
   *
   * Can be any React node, typically an SVG or icon component.
   *
   * @example
   * ```tsx
   * icon: <IconComponent />
   * ```
   */
  icon?: ReactNode;

  /**
   * Disable this specific item.
   *
   * Overrides the component-level `disabled` prop for this item only.
   *
   * @default false
   */
  disabled?: boolean;
}
```

### 6.2 Storybook Requirements

Every component needs these stories:

#### 1. Default Story (Basic Usage)

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A flexible, accessible accordion component with single or multiple expansion modes.

## Features
- Single or multiple item expansion
- Keyboard navigation (Enter, Space, Arrow keys)
- Optional scroll-based auto-expansion
- Fully customisable via CSS variables or wrapper classes
- WCAG AA compliant

## Usage
\`\`\`tsx
import { Accordion } from '@litedesigns/lite-kit';
import '@litedesigns/lite-kit/styles';

<Accordion items={items} mode="single" />
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'What is lite-kit?',
        content: 'A lightweight component library focused on functionality and accessibility.',
      },
      {
        id: '2',
        title: 'How do I install it?',
        content: 'npm install github:litedesigns/lite-kit#v2.0.0',
      },
    ],
  },
};
```

#### 2. All Variants Story

```typescript
export const SingleMode: Story = {
  name: 'Single Mode',
  args: {
    items: [...],
    mode: 'single',
  },
  parameters: {
    docs: {
      description: {
        story: 'Only one item can be open at a time. Opening a new item closes the previous one.',
      },
    },
  },
};

export const MultipleMode: Story = {
  name: 'Multiple Mode',
  args: {
    items: [...],
    mode: 'multiple',
    defaultOpen: ['1', '2'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple items can be open simultaneously.',
      },
    },
  },
};

export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    items: [
      {
        id: '1',
        title: 'Features',
        icon: <IconFeatures />,
        content: '...',
      },
    ],
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    items: [...],
    disabled: true,
  },
};
```

#### 3. Interactive Story (Play Function)

```typescript
import { expect, userEvent, within } from '@storybook/test';

export const Interactive: Story = {
  name: 'Interactive Demo',
  args: {
    items: [...],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find first accordion trigger
    const trigger = canvas.getByRole('button', { name: /item 1/i });

    // Click to open
    await userEvent.click(trigger);

    // Verify opened
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Verify content visible
    const content = canvas.getByText(/content 1/i);
    expect(content).toBeInTheDocument();
  },
};
```

#### 4. CSS Variable Theming Story

```typescript
export const CSSVariableTheming: Story = {
  name: 'CSS Variable Theming',
  args: {
    items: [...],
  },
  decorators: [
    (Story) => (
      <div
        style={{
          '--lk-accordion-item-bg': 'rgb(255, 255, 255)',
          '--lk-accordion-item-border': 'rgb(229, 231, 235)',
          '--lk-accordion-title-color': 'rgb(17, 24, 39)',
          '--lk-accordion-icon-bg': 'rgb(243, 244, 246)',
          '--lk-accordion-chevron-color': 'rgb(107, 114, 128)',
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
}
\`\`\`
        `,
      },
    },
  },
};
```

#### 5. Dark Mode Story

```typescript
export const DarkMode: Story = {
  name: 'Dark Mode',
  args: {
    items: [...],
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ background: 'rgb(17, 24, 39)', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Add \`.dark\` class to enable dark mode tokens.

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
```

#### 6. Accessibility Story

```typescript
export const Accessibility: Story = {
  name: 'Accessibility',
  args: {
    items: [...],
  },
  parameters: {
    docs: {
      description: {
        story: `
This component is fully accessible:

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA attributes (\`aria-expanded\`, \`aria-controls\`)
- ✅ Focus management
- ✅ Screen reader support
- ✅ WCAG AA compliant

Try navigating with keyboard only!
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

### 6.3 Migration Guides

For breaking changes, provide clear before/after examples.

#### Migration Guide Template

```markdown
## Migrating from v1.x to v2.x

### Breaking Changes

#### 1. Removed `theme` prop

The `theme` prop has been removed in favour of CSS variables for more flexible theming.

**Before (v1.x):**
```tsx
<Accordion items={items} theme="dark" />
```

**After (v2.x):**
```tsx
<Accordion items={items} className="dark" />
```

Or use CSS variables:
```css
.my-accordion {
  --lk-accordion-item-bg: rgb(17, 24, 39);
  --lk-accordion-title-color: white;
}
```

**Reason:** CSS variables provide more flexibility and don't require JavaScript for theme switching.

---

#### 2. Renamed `onToggle` to `onChange`

For consistency with React conventions.

**Before (v1.x):**
```tsx
<Accordion items={items} onToggle={(id) => console.log(id)} />
```

**After (v2.x):**
```tsx
<Accordion items={items} onChange={(id) => console.log(id)} />
```

**Reason:** Aligns with React naming conventions (`onChange` is standard).

---

#### 3. Changed `open` to `defaultOpen`

Clarifies controlled vs uncontrolled behaviour.

**Before (v1.x):**
```tsx
<Accordion items={items} open="1" />
```

**After (v2.x):**
```tsx
<Accordion items={items} defaultOpen="1" />
```

For controlled mode:
```tsx
<Accordion items={items} value={open} onChange={setOpen} />
```

**Reason:** Distinguishes uncontrolled (default) from controlled (value/onChange) patterns.

---

### Automated Migration (Optional)

For complex migrations, provide a codemod:

```bash
npx @litedesigns/lite-kit-codemod v1-to-v2 ./src
```
```

---

## 7. Consumer Integration Guide

This section is for developers using lite-kit in their projects (Infinity, Zest, etc.).

### 7.1 Initial Setup

#### Installation from GitHub

```bash
# Install specific version
npm install github:litedesigns/lite-kit#v2.0.0

# Or install latest
npm install github:litedesigns/lite-kit
```

#### Import Component + Styles

```tsx
// Component import
import { Accordion } from '@litedesigns/lite-kit';

// Styles import (required)
import '@litedesigns/lite-kit/styles';

function MyComponent() {
  return <Accordion items={items} />;
}
```

### 7.2 Tailwind Configuration

Add lite-kit to Tailwind content for JIT compilation:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@litedesigns/lite-kit/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

**Why this is needed:**
- lite-kit uses Tailwind classes internally for structure
- Tailwind must scan lite-kit's compiled code to include necessary utilities
- Without this, spacing/layout classes might be missing

### 7.3 Customisation Strategies

Choose the strategy that fits your use case.

#### Strategy A: CSS Variables (Recommended for Theming)

**Best for:**
- Consistent theming across entire app
- Simple value overrides (colours, spacing)
- Dark mode support
- Multiple theme variants

**Example: Global theme**
```css
/* app/globals.css */
:root {
  --lk-accordion-item-bg: white;
  --lk-accordion-item-border: #e5e7eb;
  --lk-accordion-title-color: #111827;
  --lk-accordion-icon-bg: #f3f4f6;
}

.dark {
  --lk-accordion-item-bg: rgba(0, 0, 0, 0.5);
  --lk-accordion-item-border: rgba(255, 255, 255, 0.1);
  --lk-accordion-title-color: white;
  --lk-accordion-icon-bg: rgba(255, 255, 255, 0.1);
}
```

**Example: Component-scoped theme**
```tsx
function MyComponent() {
  return (
    <div
      style={{
        '--lk-accordion-item-bg': 'white',
        '--lk-accordion-title-color': 'black',
      } as React.CSSProperties}
    >
      <Accordion items={items} />
    </div>
  );
}
```

#### Strategy B: Wrapper Classes (Recommended for Complex Styles)

**Best for:**
- Component-specific customisation
- Complex CSS (gradients, filters, animations)
- Adding new properties not covered by variables
- One-off overrides

**Example: Infinity glass morphism**
```css
/* Infinity-specific Accordion styles */
.infinity-accordion .lite-kit-accordion-item {
  background: linear-gradient(
    to bottom right,
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0.5)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.infinity-accordion .lite-kit-accordion-title {
  color: rgb(255, 255, 255);
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.infinity-accordion .lite-kit-accordion-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

```tsx
// Usage
<div className="infinity-accordion">
  <Accordion items={items} />
</div>
```

#### Strategy C: Extend with Tailwind

**Best for:**
- Quick prototyping
- Simple layout adjustments
- Spacing overrides

**Example:**
```tsx
<Accordion
  className="space-y-4 max-w-2xl mx-auto"
  itemClassName="rounded-lg shadow-md"
  items={items}
/>
```

#### Hybrid Approach (Recommended)

Combine strategies for best results:

```css
/* Use CSS variables for themeable values */
.my-accordion {
  --lk-accordion-item-border: rgba(255, 255, 255, 0.1);
  --lk-accordion-title-color: rgb(255, 255, 255);
}

/* Use wrapper classes for complex effects */
.my-accordion .lite-kit-accordion-item {
  background: linear-gradient(...);
  backdrop-filter: blur(8px);
}
```

```tsx
<div className="my-accordion space-y-4">
  <Accordion items={items} />
</div>
```

### 7.4 Migration from Wrapper Classes to CSS Variables

If currently using wrapper classes (like Infinity), you can migrate gradually without breaking changes.

**Current approach (wrapper classes):**
```css
.infinity-accordion .lite-kit-accordion-item {
  background: linear-gradient(...);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.infinity-accordion .lite-kit-accordion-title {
  color: rgb(255, 255, 255);
  font-weight: 600;
}

.infinity-accordion .lite-kit-accordion-subtitle {
  color: rgb(156, 163, 175);
}
```

**Gradual migration (CSS variables):**
```css
/* Migrate simple values to CSS variables */
.infinity-accordion {
  --lk-accordion-item-border: rgba(255, 255, 255, 0.1);
  --lk-accordion-title-color: rgb(255, 255, 255);
  --lk-accordion-title-weight: 600;
  --lk-accordion-subtitle-color: rgb(156, 163, 175);
}

/* Keep complex effects as wrapper classes */
.infinity-accordion .lite-kit-accordion-item {
  background: linear-gradient(...);  /* Complex, keep as class */
  backdrop-filter: blur(8px);        /* Not a variable */
}
```

**Benefits of gradual migration:**
- ✅ No breaking changes
- ✅ Easier to maintain (fewer selectors)
- ✅ Better dark mode support
- ✅ Scales better as components grow

### 7.5 Working with shadcn/radix-ui

lite-kit complements other UI libraries. Use them together seamlessly.

**Example: Combining lite-kit and shadcn**
```tsx
import { Accordion } from '@litedesigns/lite-kit';
import { Button } from '@/components/ui/button'; // shadcn
import { Dialog } from '@/components/ui/dialog';  // shadcn

function MyPage() {
  return (
    <>
      {/* Use lite-kit for specialised functionality */}
      <Accordion items={items} scrollDetect />

      {/* Use shadcn for general UI components */}
      <Dialog>
        <Button>Open Dialog</Button>
      </Dialog>
    </>
  );
}
```

**When to use each:**

| Use Case | Library | Reason |
|----------|---------|--------|
| Accordion with scroll detection | lite-kit | Specialised functionality |
| Standard button | shadcn | General UI component |
| Modal/dialog | shadcn/radix-ui | Excellent accessibility |
| Custom tab navigation | lite-kit | If needing custom behaviour |
| Form inputs | shadcn | Comprehensive form library |

### 7.6 Next.js Integration

lite-kit works seamlessly with Next.js (Pages Router & App Router).

#### App Router (RSC)

```tsx
// app/page.tsx
import { Accordion } from '@litedesigns/lite-kit';
import '@litedesigns/lite-kit/styles';

export default function Page() {
  return <Accordion items={items} />;
}
```

**Note:** lite-kit components have `'use client'` directive, so they work as Client Components even in RSC.

#### Pages Router

```tsx
// pages/index.tsx
import { Accordion } from '@litedesigns/lite-kit';
import '@litedesigns/lite-kit/styles';

export default function Home() {
  return <Accordion items={items} />;
}
```

#### SSR Considerations

lite-kit components are SSR-safe:
- No `window` or `document` access during render
- CSS loads before hydration (no FOUC)
- Works with Turbopack

---

## 8. Adding New Components - Step-by-Step

Use this checklist when adding a new component to lite-kit.

### Pre-Planning Phase

- [ ] **Identify specific use case** - What problem does this solve?
- [ ] **Research existing solutions** - Check shadcn, radix-ui, Headless UI
- [ ] **Determine unique value** - Why build this vs use existing?
- [ ] **Confirm lightweight** - Can it be zero dependencies?
- [ ] **Draft props API** - Design interface, get feedback
- [ ] **List accessibility requirements** - Keyboard nav, ARIA patterns

### Phase 1: Core Implementation

- [ ] **Create component directory:** `src/{component-name}/`
- [ ] **Create `types.ts`** with interfaces
- [ ] **Implement base component** in `ComponentName.tsx`
- [ ] **Add `'use client'` directive** (for Next.js RSC compatibility)
- [ ] **Apply BEM classes** to all visual elements (`.lite-kit-{component}-{element}`)
- [ ] **Use Tailwind for structure** (layout, spacing, transitions)
- [ ] **Export from `src/index.ts`**

**Example file structure:**
```
src/tabs/
├── Tabs.tsx
├── types.ts
└── (tests and stories added later)
```

**Example BEM classes:**
```tsx
<div className="lite-kit-tabs">
  <div className="lite-kit-tabs-list">
    <button className="lite-kit-tabs-trigger lite-kit-tabs-trigger--active">
      Tab 1
    </button>
  </div>
  <div className="lite-kit-tabs-content">
    Content
  </div>
</div>
```

### Phase 2: Styling

- [ ] **Create `src/styles/{component-name}.css`**
- [ ] **Define component-specific CSS variables**
- [ ] **Use semantic tokens** from `tokens.css`
- [ ] **Provide sensible defaults** (neutral colours, standard spacing)
- [ ] **Test light + dark mode**
- [ ] **Import CSS** in `src/styles/index.css`

**Example CSS structure:**
```css
/* Component tokens */
:root {
  --lk-tabs-bg: var(--lk-color-bg-base);
  --lk-tabs-border: var(--lk-color-border-base);
  --lk-tabs-trigger-color: var(--lk-color-text-secondary);
  --lk-tabs-trigger-active-color: var(--lk-color-text-primary);
}

/* Component styles */
.lite-kit-tabs {
  background: var(--lk-tabs-bg);
  border: 1px solid var(--lk-tabs-border);
}

.lite-kit-tabs-trigger {
  color: var(--lk-tabs-trigger-color);
}

.lite-kit-tabs-trigger--active {
  color: var(--lk-tabs-trigger-active-color);
}
```

### Phase 3: Accessibility

- [ ] **Implement keyboard navigation** (Tab, Enter/Space, Arrows, Escape)
- [ ] **Add ARIA attributes** (`aria-expanded`, `aria-controls`, `aria-selected`, etc.)
- [ ] **Use semantic HTML** where possible
- [ ] **Add visible focus indicators** (`:focus-visible`)
- [ ] **Test with screen reader** (VoiceOver/NVDA)
- [ ] **Run axe-core** accessibility tests

**Example keyboard navigation:**
```typescript
const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
  switch (e.key) {
    case 'ArrowRight':
      focusNextTab();
      break;
    case 'ArrowLeft':
      focusPreviousTab();
      break;
    case 'Home':
      focusFirstTab();
      break;
    case 'End':
      focusLastTab();
      break;
  }
};
```

### Phase 4: Testing

- [ ] **Create `ComponentName.test.tsx`**
- [ ] **Write unit tests** (rendering, props, state) - aim for >80% coverage
- [ ] **Write integration tests** (user interactions, callbacks)
- [ ] **Write accessibility tests** (axe-core + keyboard nav)
- [ ] **All tests pass:** `npm test`
- [ ] **Test in consumer project** via yalc

**Example test structure:**
```typescript
describe('Tabs', () => {
  describe('Unit Tests', () => {
    it('renders all tabs', () => { });
    it('applies custom className', () => { });
  });

  describe('Integration Tests', () => {
    it('switches tabs on click', () => { });
    it('calls onChange callback', () => { });
  });

  describe('Accessibility', () => {
    it('has no axe violations', () => { });
    it('supports keyboard navigation', () => { });
  });
});
```

### Phase 5: Documentation

- [ ] **Add JSDoc comments** to interfaces and component
- [ ] **Create `ComponentName.stories.tsx`** in Storybook
- [ ] **Create Default story**
- [ ] **Create variant stories** (all prop variations)
- [ ] **Create Interactive story** (play function)
- [ ] **Create CSS Variable Theming story**
- [ ] **Create Accessibility story** (a11y addon)
- [ ] **Test Storybook:** `npm run storybook`
- [ ] **Add usage examples** to README

### Phase 6: Release

- [ ] **Update `CHANGELOG.md`** with new component
- [ ] **Run `npm run build`** successfully
- [ ] **Test in Infinity** via yalc: `npm run dev`
- [ ] **Test in Zest** via yalc (if applicable)
- [ ] **Create PR** with examples and screenshots
- [ ] **Get review and approval**
- [ ] **Merge to main**
- [ ] **Release:** `npm run release`
- [ ] **Update consumer projects** to new version

### Component Quality Checklist

Before considering a component "done", verify:

- [ ] **Zero runtime dependencies** added (except React)
- [ ] **All visual elements** have BEM classes
- [ ] **All themeable properties** use CSS variables
- [ ] **Component works** without any custom styles (basic design)
- [ ] **Component can be fully customised** via CSS variables
- [ ] **Component can be fully customised** via wrapper classes
- [ ] **Keyboard navigation** fully functional
- [ ] **Zero axe-core** accessibility violations
- [ ] **Unit test coverage** >80%
- [ ] **Works in both** light and dark mode
- [ ] **Mobile responsive**
- [ ] **Documented in Storybook** with examples
- [ ] **Builds successfully** (no TypeScript errors)

---

## 9. Design Decision Framework

Use this section when faced with common design decisions.

### 9.1 When to Add a Component to lite-kit

#### ✅ YES, add to lite-kit if:

1. **Provides unique functionality** not in shadcn/radix-ui
   - Example: Accordion with scroll detection
   - Example: Tabs with auto-scroll to active

2. **Used in 2+ consumer projects** (Infinity, Zest)
   - Proves utility across different contexts
   - Worth maintaining centrally

3. **Can be implemented with zero runtime dependencies**
   - No `date-fns`, `lodash`, `chart libraries`, etc.
   - Keep bundle small

4. **Requires complex logic/state management**
   - Example: Scroll detection, IntersectionObserver
   - Example: Complex keyboard navigation
   - Justifies abstraction

5. **Has specialised behaviour**
   - Not a generic button/input
   - Provides specific functionality

#### ❌ NO, keep in consumer project if:

1. **Project-specific design requirements**
   - Tightly coupled to brand/design system
   - Unlikely to be reused

2. **Only used in one project**
   - Not worth centralising yet
   - Wait until second use case

3. **Requires heavy dependencies**
   - Chart libraries, date pickers with locales
   - Breaks "lightweight" principle

4. **Purely presentational with no logic**
   - Simple div with styles
   - Better as local component

5. **shadcn/radix-ui already provides it well**
   - Don't reinvent the wheel
   - Use existing, well-maintained solutions

### 9.2 Tailwind vs CSS Variables vs Inline Styles

#### Use Tailwind classes for:

- ✅ Layout (flex, grid, absolute, relative)
- ✅ Spacing (p-4, m-2, gap-3, space-y-4)
- ✅ Sizing (w-full, h-screen, max-w-md)
- ✅ Transitions/animations (transition-all, duration-300, ease-in-out)
- ✅ Structural positioning (justify-between, items-center)

**Example:**
```tsx
<div className="flex items-center justify-between gap-4 p-4 transition-all duration-300">
```

#### Use CSS variables for:

- ✅ Colours (text, background, borders)
- ✅ Themeable values (shadows, radii, spacing consumers might adjust)
- ✅ Font weights, sizes (if themeable)
- ✅ Any value consumers would override

**Example:**
```css
.component {
  color: var(--lk-component-text-color);
  background: var(--lk-component-bg);
  border: 1px solid var(--lk-component-border);
}
```

#### Use inline styles for:

- ✅ Dynamic values from props
- ✅ Calculated dimensions
- ✅ Temporary debugging only (remove before commit)

**Example:**
```tsx
<div style={{ width: `${percentage}%`, height: calculatedHeight }}>
```

#### ❌ Never use inline styles for:

- ❌ Static colours, spacing, sizes
- ❌ Values that could be CSS variables
- ❌ Production code (except dynamic values)

### 9.3 Component API: Simple vs Compound

#### Use Simple API (single component) for:

- ✅ Linear data structures (accordions, lists, carousels)
- ✅ Straightforward rendering (no layout flexibility needed)
- ✅ Limited customisation points (< 3 sub-elements)

**Example: Accordion (simple API)**
```tsx
<Accordion items={items} mode="single" />
```

**Pros:**
- Simple to use
- Less boilerplate
- Easier to maintain

#### Use Compound API (sub-components) for:

- ✅ Consumers need layout control
- ✅ Multiple rendering strategies
- ✅ 3+ sub-elements that might be rearranged
- ✅ Complex composition patterns

**Example: Tabs (compound API)**
```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="1">Content</TabsContent>
</Tabs>
```

**Pros:**
- Maximum flexibility
- Consumers control layout
- Supports custom rendering

**Cons:**
- More verbose
- More complex to implement
- Higher learning curve

#### Rule of Thumb

**Start simple. Only introduce compound pattern when simple API becomes limiting.**

Most components (70-80%) should use simple API. Compound pattern is the exception, not the rule.

### 9.4 Dependency Evaluation

Before adding ANY dependency, answer these questions:

#### 1. Can we implement this ourselves?

**If yes, do it.** Examples:
- `classnames` → Implement `cn()` utility (7 lines)
- `react-icons` → Inline SVG (zero dependency)

#### 2. What's the bundle size?

- Check bundlephobia.com
- Keep total lite-kit < 10kb gzipped per component
- Reject dependencies > 5kb alone

#### 3. How many consumers use it?

- Popular = safer (>1M weekly downloads)
- Check npm downloads, GitHub stars
- Active community = better support

#### 4. Is it maintained?

- Recent commits (< 6 months)
- Active issues, PRs
- Responsive maintainers
- Security updates

#### 5. Does it have dependencies?

- Fewer is better (ideally zero)
- Check dependency tree
- Transitive dependencies increase risk

#### 6. Does it bring unique value?

- Not replaceable with modern CSS
- Not replaceable with React built-ins
- Solves specific, complex problem

#### Examples

| Dependency | Verdict | Reason |
|------------|---------|--------|
| `classnames` | ❌ Reject | 7-line utility, not worth dependency |
| `react-icons` | ❌ Reject | Inline SVG, zero dependency |
| `framer-motion` | ❌ Reject | CSS transitions work fine |
| `date-fns` | ⚠️ Maybe | Heavy, but hard to replace. Evaluate per use case. |
| `react` | ✅ Accept | Core dependency, necessary |
| `lodash` | ❌ Reject | Native ES6 covers 90% of use cases |

### 9.5 Breaking Changes Policy

**Avoid breaking changes except for major versions.**

#### Minor versions (v2.1, v2.2):
- ✅ New features
- ✅ New props (optional)
- ✅ Bug fixes
- ❌ NO breaking changes

#### Major versions (v3.0, v4.0):
- ✅ Breaking changes allowed
- ✅ Must document in `MIGRATION_GUIDE.md`
- ✅ Provide deprecation warnings one version early
- ✅ Update consumer projects immediately

#### Example Deprecation Flow

**v2.0 - Introduce new API, deprecate old:**
```typescript
/**
 * @deprecated Use CSS variables instead. Will be removed in v3.0.0.
 * @example
 * // Before: <Accordion theme="dark" />
 * // After: <Accordion className="dark" />
 */
theme?: 'light' | 'dark';
```

**v2.1, v2.2 - Keep both APIs, warn in console:**
```typescript
if (theme) {
  console.warn('Accordion: `theme` prop is deprecated and will be removed in v3.0.0. Use CSS variables or className instead.');
}
```

**v3.0 - Remove deprecated API:**
```typescript
// Property removed. Use CSS variables or className.
// See MIGRATION_GUIDE.md for details.
```

#### Breaking Change Documentation

For every breaking change, document:
1. **What changed** (prop removed, behaviour changed)
2. **Why it changed** (rationale)
3. **How to migrate** (before/after code examples)
4. **Automated migration** (codemod if available)

**Example:**
```markdown
## Breaking Change: Removed `theme` prop

**Reason:** CSS variables provide more flexibility and don't require JavaScript for theme switching.

**Before:**
```tsx
<Accordion items={items} theme="dark" />
```

**After:**
```tsx
<Accordion items={items} className="dark" />
```

Or use CSS variables:
```css
.my-accordion {
  --lk-accordion-item-bg: rgb(17, 24, 39);
  --lk-accordion-title-color: white;
}
```
```

---

## Appendix

### A. Useful Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vitest Documentation](https://vitest.dev/)
- [Storybook Documentation](https://storybook.js.org/docs)

### B. BEM Naming Reference

**Pattern:** `.lite-kit-{component}-{element}[--modifier]`

**Examples:**
- `.lite-kit-accordion-item` (block)
- `.lite-kit-accordion-title` (element)
- `.lite-kit-accordion-item--open` (modifier - state)
- `.lite-kit-accordion-item--card` (modifier - variant)
- `.lite-kit-accordion-icon--active` (element with modifier)

### C. CSS Variable Naming Reference

**Pattern:** `--lk-{category}-{property}[-{variant}]`

**Primitive tokens:**
- `--lk-gray-500`
- `--lk-space-4`
- `--lk-radius-md`
- `--lk-shadow-sm`

**Semantic tokens:**
- `--lk-color-text-primary`
- `--lk-color-bg-base`
- `--lk-color-border-hover`

**Component tokens:**
- `--lk-accordion-item-bg`
- `--lk-accordion-title-color`
- `--lk-accordion-chevron-size`

### D. Keyboard Navigation Reference

| Component | Key | Action |
|-----------|-----|--------|
| **Accordion** | Tab | Focus next trigger |
| | Enter/Space | Toggle item |
| **Tabs** | Tab | Focus next interactive element |
| | Arrow Left/Right | Navigate between tabs |
| | Home/End | First/last tab |
| **Modal** | Escape | Close modal |
| | Tab | Focus trap within modal |
| **Dropdown** | Enter/Space | Open dropdown |
| | Arrow Up/Down | Navigate options |
| | Escape | Close dropdown |

### E. ARIA Patterns Reference

| Component | Role | Attributes |
|-----------|------|------------|
| **Accordion** | `button` (trigger) | `aria-expanded`, `aria-controls`, `aria-disabled` |
| | `region` (content) | `aria-labelledby` |
| **Tabs** | `tablist` (list) | none |
| | `tab` (trigger) | `aria-selected`, `aria-controls` |
| | `tabpanel` (content) | `aria-labelledby` |
| **Modal** | `dialog` | `aria-modal`, `aria-labelledby`, `aria-describedby` |
| **Dropdown** | `button` (trigger) | `aria-expanded`, `aria-controls`, `aria-haspopup` |
| | `menu` (list) | `aria-labelledby` |
| | `menuitem` (option) | none |

---

## Changelog

### v2.0.0 (2026-02-02)

- Initial design philosophy document
- Established three-layer CSS architecture
- Defined token hierarchy (primitive → semantic → component)
- Documented component anatomy patterns
- Created comprehensive testing strategy
- Established accessibility requirements
- Provided consumer integration guide
- Created component addition checklist
- Documented design decision framework

---

**This document is the canonical reference for all lite-kit development. When in doubt, refer back to these principles.**
