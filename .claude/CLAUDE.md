# lite-kit

Shared component library for LiteDesigns projects (Infinity, Zest).

## Tech Stack
- TypeScript, React 18
- tsup for building
- yalc for local development

## Commands
- `npm run dev` - Watch mode (auto-pushes to yalc)
- `npm run build` - Production build
- `npm run release` - Release new version (runs `scripts/release.sh`)

## Consumer Projects
- Infinity: `~/Repos/infinity`
- Zest: `~/Repos/zest`

## Current Components
- **Accordion** - with scroll detection, customisable via CSS classes

## Local Development Workflow

When working on lite-kit alongside a consumer project (e.g., Infinity):

### Initial Setup (one-time)
```bash
# In lite-kit: publish to local yalc store
cd ~/Repos/litedesigns/lite-kit
yalc publish

# In consumer project: link to local lite-kit
cd ~/Repos/infinity
npm run setup:local
```

### Development (watch mode)
```bash
# Option 1: Run both manually in separate terminals
# Terminal 1 - lite-kit (watches & auto-pushes changes)
cd ~/Repos/litedesigns/lite-kit
npm run dev

# Terminal 2 - consumer project
cd ~/Repos/infinity
npm run dev

# Option 2: Use the convenience script (Infinity only)
cd ~/Repos/infinity
npm run dev:full  # Runs both concurrently
```

### When Finished
**Important**: Remove yalc link before committing/pushing:
```bash
cd ~/Repos/infinity
npm run reset:local  # Removes yalc, restores GitHub reference
```

### Releasing a New Version
1. Commit all changes to lite-kit
2. Update CHANGELOG.md
3. Run `npm run release` (bumps version, builds, tags, pushes)
4. Update consumer projects to new version:
   ```bash
   npm install github:litedesigns/lite-kit#vX.Y.Z
   ```

## File Structure
```
lite-kit/
├── src/
│   ├── index.ts           # Main exports
│   ├── accordion/         # Accordion component
│   │   ├── Accordion.tsx
│   │   └── types.ts
│   └── utils/
│       └── cn.ts          # Class name utility
├── dist/                  # Built output (committed for GitHub installs)
├── scripts/
│   └── release.sh         # Release automation
├── tsup.config.ts         # Build configuration
└── CHANGELOG.md           # Version history
```

## Styling Components

Components use BEM-style CSS classes for customisation:
```css
/* Example: Accordion */
.lite-kit-accordion-item { }
.lite-kit-accordion-item--open { }
.lite-kit-accordion-title { }
.lite-kit-accordion-subtitle { }
.lite-kit-accordion-icon { }
.lite-kit-accordion-chevron { }
.lite-kit-accordion-content-inner { }
```

Consumer projects can override styles by targeting these classes with a wrapper class (e.g., `.infinity-accordion .lite-kit-accordion-item { }`).

## Pre-push Safety

Consumer projects have a pre-push hook that:
1. Checks if lite-kit has uncommitted changes
2. Blocks push if package.json contains yalc reference

This prevents accidentally deploying with local-only dependencies.
