# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
