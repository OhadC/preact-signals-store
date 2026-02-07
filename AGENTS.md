# AGENTS.md

A guide for AI coding agents working with the `preact-signals-store` monorepo.

## Project Overview

**preact-signals-store** is a lightweight, type-safe reactive state management library built on `@preact/signals-core`. It provides a simple yet powerful way to create reactive stores with full TypeScript support.

### Key Features

- 🚀 **Lightweight** — Minimal overhead, built on `@preact/signals-core`
- 🔒 **Type-safe** — Full TypeScript support with automatic type inference
- ⚡ **Reactive** — Fine-grained reactivity with computed values
- 🎯 **Simple API** — Intuitive store creation with `get`, `set`, and `update`
- 🔄 **Smart Updates** — Built-in deep equality checks to prevent unnecessary re-renders
- 📦 **Framework Agnostic** — Works with Preact, React, or vanilla JavaScript

## Repository Structure

```
preact-signals-store/
├── packages/
│   ├── preact-signals-store/     # Core library package
│   │   ├── src/
│   │   │   ├── index.ts          # Entry point, re-exports types and store
│   │   │   ├── store.ts          # createSignalStore implementation
│   │   │   ├── types.ts          # TypeScript type definitions
│   │   │   ├── store.test.ts     # Comprehensive test suite
│   │   │   └── utils/            # Utility functions (deepEqual, isFunction)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsdown.config.ts      # Build configuration
│   │   └── vitest.config.ts      # Test configuration
│   ├── test-core/                # Tests with @preact/signals-core
│   ├── test-preact/              # Tests with @preact/signals
│   └── test-react/               # Tests with @preact/signals-react
├── .github/workflows/            # CI/CD configuration
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml           # pnpm workspace definition + catalog
├── turbo.json                    # Turborepo task configuration
├── tsconfig.json                 # Root TypeScript config
├── vitest.config.ts              # Root Vitest config
├── CHANGELOG.md                  # Version history
└── .prettierrc.mjs               # Prettier formatting config
```

## Setup Commands

```bash
# Install all dependencies (from repository root)
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages (if configured)
pnpm lint
```

### Package-Specific Commands

```bash
# Build specific package
pnpm turbo run build --filter=preact-signals-store

# Test specific package
pnpm turbo run test --filter=preact-signals-store

# Run tests in watch mode (from package directory)
cd packages/preact-signals-store
pnpm vitest
```

## Build System

- **Package Manager**: pnpm 10+ with workspace support
- **Monorepo Orchestration**: Turborepo
- **Build Tool**: tsdown (TypeScript-first bundler)
- **Test Framework**: Vitest 4+
- **TypeScript**: 5.8+ with strict mode enabled

### Build Outputs

The main package (`preact-signals-store`) builds to:

- `dist/index.mjs` — ESM module
- `dist/index.cjs` — CommonJS module
- `dist/index.d.mts` — ESM type declarations
- `dist/index.d.cts` — CommonJS type declarations

## Code Style

### TypeScript Guidelines

- **Strict mode enabled** — All strict type checking rules apply
- **ES2020 target** — Modern JavaScript features available
- **No semicolons** — Prefer no semicolons (configured in Prettier)
- **Double quotes** — Use double quotes for strings
- **4-space indentation** — Tab width of 4 spaces
- **140 character line width** — Long lines allowed for readability

### Import Order (enforced by Prettier)

1. Built-in Node.js modules
2. Third-party modules (npm packages)
3. Relative imports (starting with `.`)

### Formatting Configuration

The project uses Prettier with `@ianvs/prettier-plugin-sort-imports`:

```javascript
{
    printWidth: 140,
    tabWidth: 4,
    singleQuote: false,
    arrowParens: "avoid",
}
```

## Testing Instructions

### Test Framework

This project uses **Vitest** for testing. Tests are located alongside source files with `.test.ts` suffix.

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests for specific package
pnpm turbo run test --filter=preact-signals-store

# Run specific test file
cd packages/preact-signals-store
pnpm vitest run src/store.test.ts

# Run tests in watch mode
pnpm vitest

# Run specific test by pattern
pnpm vitest run -t "should create a store"
```

### Test Patterns

Tests follow these conventions:

- Organized in `describe` blocks by functionality
- Use clear, descriptive test names that explain the expected behavior
- Import from `vitest`: `describe`, `expect`, `it`, `vi`
- Import `effect` and `computed` from `@preact/signals-core` for reactivity tests

### Test Categories

The main test suite (`store.test.ts`) covers:

1. **Store Creation** — Basic initialization, name support, initial state
2. **Actions** — `get()`, `set()`, `update()`, async actions, return values
3. **Direct State Methods** — `setState()`, `updateState()`
4. **Computed Values** — Single/multiple computes, derived computes, array handling
5. **Deep Equality Checks** — Reference preservation, nested objects, arrays
6. **Signal Reactivity** — Effects, subscription behavior
7. **Complex State Types** — Nested objects, arrays, null/undefined values
8. **Edge Cases** — Rapid updates, reference stability, cross-store dependencies
9. **Type Safety** — Compile-time type checking validation

### Cross-Package Testing

The `test-core`, `test-preact`, and `test-react` packages verify the library works correctly with different `@preact/signals` variants:

- `test-core` — Uses `@preact/signals-core` directly
- `test-preact` — Uses `@preact/signals` (includes core internally)
- `test-react` — Uses `@preact/signals-react` (React integration)

## Architecture

### Core API

The library exports one main function and several types:

```typescript
// Main function
export { createSignalStore } from "./store";

// Types
export type {
    CreateSignalStoreActionParams,
    CreateSignalStoreOptions,
    SignalStore,
    SignalStoreActions,
    SignalStoreAdditionalProps,
    SignalStoreComputes,
    SignalStoreState,
} from "./types";
```

### createSignalStore Options

```typescript
interface CreateSignalStoreOptions<TState, TActions, TComputes> {
    name?: string; // Optional store identifier
    initialState: TState | (() => TState); // Initial state value or factory
    getComputes?: (stateS: ReadonlySignal<TState>) => TComputes; // Optional computed signals
    getActions: (params: CreateSignalStoreActionParams<TState, TComputes>) => TActions;
    disableSetValidation?: boolean; // Skip deep equality check (default: false)
}
```

### Action Parameters

Actions receive these utilities:

- `get()` — Read current state without subscribing (uses `Signal.peek()`)
- `set(value)` — Replace entire state
- `update(partial)` — Merge partial state (object spread)
- `computes` — Access to computed values

### Store Properties

The returned store extends `Signal<TState>` with:

- `store.value` — Reactive state access
- `store.computes` — Object containing computed signals
- `store.actions` — Object containing action functions
- `store.setState(value)` — Direct state replacement
- `store.updateState(partial)` — Direct partial update
- `store.name` — Optional store identifier

## Key Implementation Details

### Deep Equality

The `deepEqual` utility in `utils/utils.ts` prevents unnecessary re-renders:

- Compares object keys recursively
- Handles arrays, nested objects, primitives
- Returns true if values are structurally equal
- Can be disabled with `disableSetValidation: true`

### Computed Values Order

Type inference requires specific ordering:

- `getComputes` must be defined **before** `getActions`
- `getComputes` should use the `stateS` parameter, not the store directly
- `getActions` can access `computes` via the params object

### Initial State Factory

For memory optimization, pass a function instead of an object:

```typescript
createSignalStore({
    initialState: () => ({ largeFata: [] }),
    // ...
});
```

This prevents the initial data from being retained in the closure.

## Dependencies

### Peer Dependencies

The library requires one of:

- `@preact/signals-core` ^1.0.0 — For vanilla JS usage
- `@preact/signals` ^2.0.0 — For Preact projects (includes core)
- `@preact/signals-react` ^3.0.0 — For React projects

### Dev Dependencies (from pnpm catalog)

```yaml
tsdown: ^0.20.3
typescript: ^5.8.0
turbo: ^2.5.0
vitest: ^4.0.18
@preact/signals-core: ^1.8.0
```

## Common Tasks

### Adding a New Feature

1. Implement in `packages/preact-signals-store/src/`
2. Export from `index.ts` if public API
3. Add/update types in `types.ts`
4. Write tests in corresponding `.test.ts` file
5. Run `pnpm build && pnpm test` to verify
6. Run `pnpm typecheck` to ensure type safety

### Adding a New Test Package

1. Create directory under `packages/`
2. Add `package.json` with appropriate signals dependency
3. Create test files importing from `preact-signals-store`
4. Add to `pnpm-workspace.yaml` if needed (glob `packages/*` covers it)

### Publishing

```bash
# From packages/preact-signals-store directory
npm publish --access public
```

The published package includes only the `dist/` folder (configured in `files` array).

## PR Guidelines

- **Title format**: `[package-name] Description of change`
- **Always run before committing**:
    ```bash
    pnpm build
    pnpm test
    pnpm typecheck
    ```
- Add or update tests for any code changes
- Ensure all tests pass before merging
- Keep the public API minimal and well-documented

## Troubleshooting

### Common Issues

1. **Type errors with computed values**: Ensure `getComputes` is defined before `getActions`

2. **State not updating**: Check if `disableSetValidation` is false and new value is deeply equal

3. **Memory leaks**: Use function form for `initialState` with large objects

4. **Cross-store reactivity issues**: Use `store.value` (subscribes) not `store.peek()` for reactive dependencies

### Debugging Tips

- Use `store.name` property for identification during debugging
- Check `store.value` vs calling `actions` to trace reactivity
- Use Chrome DevTools with Preact/React Devtools for signal inspection

## Links

- **Repository**: https://github.com/OhadC/preact-signals-store
- **npm Package**: https://www.npmjs.com/package/preact-signals-store
- **Preact Signals Docs**: https://preactjs.com/guide/v10/signals/
