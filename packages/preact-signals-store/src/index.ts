/**
 * preact-signals-store
 *
 * A lightweight, type-safe reactive state management library built on @preact/signals-core
 */

// Re-export types
export type {
    CreateSignalStoreActionParams,
    CreateSignalStoreOptions,
    SignalStore,
    SignalStoreActions,
    SignalStoreAdditionalProps,
    SignalStoreComputes,
    SignalStoreState,
} from "./types";

// Re-export store
export { createSignalStore } from "./store";
