# Transform preact-signals-store into pnpm + Turborepo Monorepo

Transform the current single-file `preact-signals-store` repository into a pnpm monorepo with turborepo, creating separate packages for the implementation and testing with different `@preact/signals-*` variants.

**Build tool**: Using **tsdown** - a fast TypeScript bundler powered by Rolldown/Oxc that auto-generates `.d.ts` files and supports ESM/CJS output.

**Test framework**: Using **vitest** matching the reference repo.

---

## Proposed Changes

### Root Configuration Files

#### [NEW] [pnpm-workspace.yaml](file:///e:/Programming/preact-signals-store/pnpm-workspace.yaml)

Define workspace packages:

```yaml
packages:
  - "packages/*"
```

---

#### [NEW] [turbo.json](file:///e:/Programming/preact-signals-store/turbo.json)

Turborepo pipeline configuration for build/test orchestration:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

#### [MODIFY] [package.json](file:///e:/Programming/preact-signals-store/package.json)

Convert to monorepo root with shared devDependencies and workspace scripts:

- Add `"private": true`
- Add turborepo, vitest, typescript as devDependencies
- Add scripts: `build`, `test`, `lint`, `typecheck`
- Keep `packageManager` setting

---

#### [NEW] [tsconfig.json](file:///e:/Programming/preact-signals-store/tsconfig.json)

Base TypeScript config with paths for workspace packages.

---

#### [NEW] [vitest.config.ts](file:///e:/Programming/preact-signals-store/vitest.config.ts)

Root vitest configuration with workspace pattern to discover package tests.

---

### Main Package: preact-signals-store

#### [NEW] [packages/preact-signals-store/tsdown.config.ts](file:///e:/Programming/preact-signals-store/packages/preact-signals-store/tsdown.config.ts)

```typescript
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
});
```

#### [NEW] [packages/preact-signals-store/package.json](file:///e:/Programming/preact-signals-store/packages/preact-signals-store/package.json)

```json
{
  "name": "preact-signals-store",
  "version": "1.0.0",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsdown",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "@preact/signals-core": "^1.0.0"
  },
  "devDependencies": {
    "@preact/signals-core": "^1.8.0",
    "tsdown": "^0.12.0",
    "typescript": "^5.8.0"
  },
  "files": ["dist", "src"]
}
```

#### [NEW] [packages/preact-signals-store/src/index.ts](file:///e:/Programming/preact-signals-store/packages/preact-signals-store/src/index.ts)

Move `signal-store.ts` content here (with minor cleanup).

#### [NEW] [packages/preact-signals-store/tsconfig.json](file:///e:/Programming/preact-signals-store/packages/preact-signals-store/tsconfig.json)

Package-level TypeScript config extending root.

#### [DELETE] [signal-store.ts](file:///e:/Programming/preact-signals-store/signal-store.ts)

Moved to `packages/preact-signals-store/src/index.ts`.

---

### Test Packages

The key insight: All three `@preact/signals-*` packages internally use `@preact/signals-core`. Our store depends on `@preact/signals-core`, but users may install any of:

- `@preact/signals-core` (vanilla, no framework)
- `@preact/signals` (Preact integration, re-exports core)
- `@preact/signals-react` (React integration, re-exports core)

Each test package validates compatibility with its respective signals package.

---

#### [NEW] packages/test-core/

Test package validating core compatibility.

| File                | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `package.json`      | Dependencies: `@preact/signals-core`, `preact-signals-store`, `vitest` |
| `src/store.test.ts` | Tests using `@preact/signals-core` directly                            |
| `tsconfig.json`     | Extends root                                                           |
| `vitest.config.ts`  | Package vitest config                                                  |

---

#### [NEW] packages/test-preact/

Test package validating Preact compatibility.

| File                | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `package.json`      | Dependencies: `@preact/signals`, `preact`, `preact-signals-store`, `vitest` |
| `src/store.test.ts` | Tests using `@preact/signals` (which re-exports core)                       |
| `tsconfig.json`     | Extends root                                                                |
| `vitest.config.ts`  | Package vitest config                                                       |

---

#### [NEW] packages/test-react/

Test package validating React compatibility.

| File                | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `package.json`      | Dependencies: `@preact/signals-react`, `react`, `react-dom`, `preact-signals-store`, `vitest` |
| `src/store.test.ts` | Tests using `@preact/signals-react` (which re-exports core)                                   |
| `tsconfig.json`     | Extends root                                                                                  |
| `vitest.config.ts`  | Package vitest config                                                                         |

---

## Final Directory Structure

```
preact-signals-store/
├── package.json              # Root with workspaces
├── pnpm-workspace.yaml       # Workspace definition
├── turbo.json                # Turborepo config
├── tsconfig.json             # Base TS config
├── vitest.config.ts          # Root vitest config
├── .prettierrc.mjs           # (existing)
└── packages/
    ├── preact-signals-store/ # Main publishable package
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       └── index.ts
    ├── test-core/            # Tests with @preact/signals-core
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vitest.config.ts
    │   └── src/
    │       └── store.test.ts
    ├── test-preact/          # Tests with @preact/signals
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vitest.config.ts
    │   └── src/
    │       └── store.test.ts
    └── test-react/           # Tests with @preact/signals-react
        ├── package.json
        ├── tsconfig.json
        ├── vitest.config.ts
        └── src/
            └── store.test.ts
```

---

## Verification Plan

### Automated Tests

1. **Install dependencies and build**

   ```bash
   pnpm install
   pnpm build
   ```

2. **Run all tests**

   ```bash
   pnpm test
   ```

   Expected: All test packages pass, validating compatibility with all three signals variants.

3. **Type checking**
   ```bash
   pnpm typecheck
   ```
   Expected: No TypeScript errors across all packages.

### Manual Verification

After implementation, please verify:

1. The main package `packages/preact-signals-store` can be built standalone
2. Each test package correctly resolves its signals dependency
3. `turbo run build` correctly respects the dependency graph
