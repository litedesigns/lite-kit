# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-02

### Added

- **Design Philosophy Document** (`/docs/DESIGN_PHILOSOPHY.md`) - Comprehensive guide covering:
  - Core philosophy and design principles
  - CSS architecture (three-layer system: Tailwind + BEM + CSS Variables)
  - Token hierarchy (primitive → semantic → component)
  - Component anatomy and TypeScript patterns
  - Testing strategy and coverage targets
  - Documentation standards
  - Consumer integration guide
  - Component addition checklist
  - Design decision framework
- **CSS Token System** (`/src/styles/tokens.css`) - Design tokens including:
  - Primitive tokens (colours, spacing, radii, shadows, transitions, z-index)
  - Semantic tokens (text, border, background, state colours)
  - Dark mode support (class-based `.dark`, data attribute `data-theme="dark"`, system preference)
- **Accordion CSS Variables** - Full CSS variable implementation in `/src/styles/accordion.css`:
  - Item variables (background, border, radius, padding, shadow)
  - Icon variables (size, background, colour)
  - Text variables (title, subtitle, content colours and weights)
  - Chevron variables (colour, size)
  - Transition variables (duration)
- **Storybook Stories**:
  - CSS Variable Theming story demonstrating customisation
  - Dark Mode story showing `.dark` class usage
- **Tests** - CSS variable support tests verifying BEM classes and modifiers

### Changed

- **Accordion Component** - Updated to use CSS variables for all themeable properties
- **Styling Architecture** - Established three-layer system:
  - Layer 1: Structural classes (Tailwind - dev-time only)
  - Layer 2: Semantic BEM classes (customisation hooks)
  - Layer 3: CSS variables (design tokens)
- **Documentation** - Updated README with comprehensive styling and theming section

### Migration Guide

This is a **non-breaking change**. Existing consumer code continues to work:
- Both CSS variables AND wrapper class overrides are supported
- Dark mode works automatically with `.dark` class or system preference
- Existing glass morphism overrides (Infinity) remain functional
- Consumers can adopt CSS variables gradually

**New CSS variable approach (optional):**
```css
.my-accordion {
  --lk-accordion-item-bg: white;
  --lk-accordion-item-border: rgb(229, 231, 235);
  --lk-accordion-title-color: rgb(17, 24, 39);
}
```

**Existing wrapper class approach (still works):**
```css
.my-accordion .lite-kit-accordion-item {
  background: white;
  border: 1px solid #e5e7eb;
}
```

## [1.1.1] - 2026-02-01

### Fixed

- Improved accordion scroll detection timing - now waits for expansion animation to complete before scrolling
- Fixed centring behaviour for expanded accordion items on mobile
- Resolved issue where scroll detection would switch to wrong item after manual tap

### Changed

- Removed separate `useScrollDetection` hook - logic now integrated directly into Accordion component
- Increased chevron icon size from 16px to 20px for better visibility

## [1.1.0] - 2026-02-01

### Changed

- Simplified accordion API and improved scroll detection reliability
- Streamlined scroll configuration options

## [1.0.0] - 2026-01-31

### Added

- Initial release of `@litedesigns/lite-kit`
- **Accordion component** with the following features:
  - Single/multiple expansion modes
  - Scroll-based auto-expansion (Mac Gallery style)
  - Light, dark, and system theme presets
  - Card, default, and minimal visual variants
  - Icon and subtitle support
  - Configurable hysteresis for scroll detection
  - Scroll-to-centre on manual tap
  - Full TypeScript support
- **useScrollDetection hook** - Reusable scroll-based detection logic
- **CSS variables** for customisable theming
- **cn utility** for class name merging
