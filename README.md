# preact-signals-store

<div align="center">

[![npm](https://img.shields.io/npm/v/preact-signals-store.svg?logo=npm&logoColor=white)](https://www.npmjs.com/package/preact-signals-store)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220.svg?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5-EF4444.svg?logo=turborepo&logoColor=white)](https://turbo.build/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

**A lightweight, type-safe reactive state management library built on `@preact/signals-core`**

[Features](#features) •
[Installation](#installation) •
[Quick Start](#quick-start) •
[Documentation](#documentation) •
[Development](#development)

</div>

---

## Overview

**preact-signals-store** provides a simple yet powerful way to create reactive stores with full TypeScript support. It leverages the reactive primitive from `@preact/signals-core` to deliver efficient, fine-grained reactivity with automatic deep equality checks to prevent unnecessary updates.

## Features

- 🚀 **Lightweight** — Minimal overhead, built on `@preact/signals-core`
- 🔒 **Type-safe** — Full TypeScript support with automatic type inference
- ⚡ **Reactive** — Fine-grained reactivity with computed values
- 🎯 **Simple API** — Intuitive store creation with `get`, `set`, and `update`
- 🔄 **Smart Updates** — Built-in deep equality checks to prevent unnecessary re-renders
- 📦 **Framework Agnostic** — Works with Preact, React, or vanilla JavaScript

## Packages

This monorepo contains the following packages:

| Package                                                   | Description                        |
| --------------------------------------------------------- | ---------------------------------- |
| [`preact-signals-store`](./packages/preact-signals-store) | The core store library             |
| [`test-core`](./packages/test-core)                       | Tests with `@preact/signals-core`  |
| [`test-preact`](./packages/test-preact)                   | Tests with `@preact/signals`       |
| [`test-react`](./packages/test-react)                     | Tests with `@preact/signals-react` |

## Installation

```bash
# Using npm
npm install preact-signals-store @preact/signals-core

# Using pnpm
pnpm add preact-signals-store @preact/signals-core

# Using yarn
yarn add preact-signals-store @preact/signals-core
```

### Framework-specific Installation

For **Preact** projects:

```bash
pnpm add preact-signals-store @preact/signals
```

For **React** projects:

```bash
pnpm add preact-signals-store @preact/signals-react
```

## Quick Start

```typescript
import { computed } from "@preact/signals-core";
import { createSignalStore } from "preact-signals-store";

// Create a counter store
const counterStore = createSignalStore({
    name: "counter",
    initialState: { count: 0 },
    getComputes: stateS => ({
        doubled: computed(() => stateS.value.count * 2),
    }),
    getActions: ({ get, update }) => ({
        increment: () => update({ count: get().count + 1 }),
        decrement: () => update({ count: get().count - 1 }),
        reset: () => update({ count: 0 }),
    }),
});

// Use the store
counterStore.actions.increment();
console.log(counterStore.value); // { count: 1 }
console.log(counterStore.computes.doubled.value); // 2
```

## Documentation

For detailed documentation, see the [preact-signals-store package README](./packages/preact-signals-store/README.md).

## Development

This project uses **pnpm** as the package manager and **Turborepo** for monorepo management.

### Prerequisites

- Node.js 18+
- pnpm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/OhadC/preact-signals-store.git
cd preact-signals-store

# Install dependencies
pnpm install
```

### Scripts

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

### Project Structure

```
preact-signals-store/
├── packages/
│   ├── preact-signals-store/  # Core library
│   │   ├── src/
│   │   │   └── index.ts       # Main source file
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── test-core/             # Tests with @preact/signals-core
│   ├── test-preact/           # Tests with @preact/signals
│   └── test-react/            # Tests with @preact/signals-react
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
├── turbo.json                 # Turborepo config
└── vitest.config.ts           # Vitest configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ using <a href="https://preactjs.com/guide/v10/signals/">Preact Signals</a>
</div>
