# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-02-07

### Added

- `SignalStoreComputes<TStore>` utility type to extract computes type from a store
- GitHub Actions CI/CD workflow for automated testing and publishing
- `sideEffects: false` for better tree-shaking support

### Fixed

- Typo in JSDoc comments ("sore" → "store")

## [1.0.0] - 2026-02-06

### Added

- Initial release of `preact-signals-store`
- `createSignalStore` function for creating reactive stores
- Type-safe actions with `get`, `set`, and `update` utilities
- Computed values support via `getComputes` option
- Deep equality checks to prevent unnecessary signal updates
- `disableSetValidation` option for performance-critical scenarios
- `SignalStoreState<TStore>` utility type to extract state type
- `SignalStoreActions<TStore>` utility type to extract actions type
- Cross-framework compatibility (Preact, React, vanilla JS)
- Comprehensive test suite with Vitest
- Monorepo structure with pnpm workspaces and Turborepo

[Unreleased]: https://github.com/OhadC/preact-signals-store/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/OhadC/preact-signals-store/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/OhadC/preact-signals-store/releases/tag/v1.0.0
