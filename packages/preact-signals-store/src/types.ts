import type { ReadonlySignal, Signal } from "@preact/signals-core";
import { AnyFunction } from "./utils/types-utils";

/**
 * Parameters passed to the `getActions` function when creating a signal store.
 * These provide the core utilities for reading and modifying store state.
 *
 * @typeParam TState - The shape of the store's state object
 * @typeParam TComputes - The shape of the computed values object
 *
 * @example
 * ```typescript
 * getActions: ({ get, set, update, computes }) => ({
 *   increment: () => update({ count: get().count + 1 }),
 *   reset: () => set({ count: 0 }),
 *   getDoubled: () => computes.doubled.value
 * })
 * ```
 */
export type CreateSignalStoreActionParams<TState, TComputes> = {
    /**
     * Gets the current state value without subscribing to changes.
     * Uses `Signal.peek()` internally.
     * @returns The current state value
     */
    get: () => TState;

    /**
     * Replaces the entire state with a new value.
     * By default, performs deep equality check to avoid unnecessary updates.
     * @param value - The new complete state value
     */
    set: (value: TState) => void;

    /**
     * Partially updates the state by merging the provided partial state.
     * Only works with object states; for primitives, use `set()` instead.
     * @param value - Partial state to merge with current state
     */
    update: (value: Partial<TState>) => void;

    /**
     * Access to computed values defined in `getComputes`.
     * Allows actions to read computed values.
     */
    computes: TComputes;
};

/**
 * Additional properties added to the base Signal to create a SignalStore.
 * @internal
 */
export type SignalStoreAdditionalProps<TState, TActions, TComputes> = {
    /** Optional name for debugging and identification purposes */
    name?: string;
    /** Object containing all computed signals */
    computes: TComputes;
    /** Object containing all action functions */
    actions: TActions;
    /** Direct method to replace the entire state */
    setState: (value: TState) => void;
    /** Direct method to partially update the state */
    updateState: (value: Partial<TState>) => void;
};

/**
 * The main store type returned by `createSignalStore`.
 * Extends the base `Signal` with additional properties for state management.
 *
 * @typeParam TState - The shape of the store's state object
 * @typeParam TActions - The shape of the actions object containing action functions
 * @typeParam TComputes - The shape of the computed values object (optional)
 *
 * @example
 * ```typescript
 * // The store is both a Signal and has additional properties
 * const store = createSignalStore({...});
 *
 * // Access state value (reactive)
 * console.log(store.value); // { count: 0 }
 *
 * // Call actions
 * store.actions.increment();
 *
 * // Access computed values
 * console.log(store.computes.doubled.value);
 * ```
 */
export type SignalStore<
    TState,
    TActions extends Record<string, AnyFunction>,
    TComputes extends Record<string, ReadonlySignal<any>> = Record<never, never>,
> = Signal<TState> & SignalStoreAdditionalProps<TState, TActions, TComputes>;

/**
 * Utility type to extract the state type from a SignalStore.
 *
 * @typeParam TStore - A SignalStore type
 *
 * @example
 * ```typescript
 * const counterStore = createSignalStore({...});
 * type CounterState = SignalStoreState<typeof counterStore>;
 * // { count: number }
 * ```
 */
export type SignalStoreState<TStore extends SignalStore<any, any, any>> = TStore extends Signal<infer TState> ? TState : never;

/**
 * Utility type to extract the actions type from a SignalStore.
 *
 * @typeParam TStore - A SignalStore type
 *
 * @example
 * ```typescript
 * const counterStore = createSignalStore({...});
 * type CounterActions = SignalStoreActions<typeof counterStore>;
 * // { increment: () => void; decrement: () => void }
 * ```
 */
export type SignalStoreActions<TStore extends SignalStore<any, any, any>> =
    TStore["actions"] extends Record<string, AnyFunction> ? TStore["actions"] : never;

/**
 * Utility type to extract the computes type from a SignalStore.
 *
 * @typeParam TStore - A SignalStore type
 *
 * @example
 * ```typescript
 * const counterStore = createSignalStore({...});
 * type CounterComputes = SignalStoreComputes<typeof counterStore>;
 * // { doubled: ReadonlySignal<number> }
 * ```
 */
export type SignalStoreComputes<TStore extends SignalStore<any, any, any>> =
    TStore["computes"] extends Record<string, ReadonlySignal<any>> ? TStore["computes"] : never;

/**
 * Configuration options for `createSignalStore`.
 *
 * @typeParam TState - The shape of the store's state object
 * @typeParam TActions - The shape of the actions object (inferred from `getActions`)
 * @typeParam TComputes - The shape of computed values object (inferred from `getComputes`)
 */
export type CreateSignalStoreOptions<
    TState,
    TActions extends Record<string, AnyFunction>,
    TComputes extends Record<string, ReadonlySignal<any>> = Record<never, never>,
> = {
    /** Optional name for debugging and identification */
    name?: string;
    /** The initial state value, or a function that returns the initial state */
    initialState: TState | (() => TState);
    /**
     * Optional function that receives the state signal and returns computed signals.
     * For type inference, getComputes must:
     * - be before getActions.
     * - Not access the created store directly (use `stateS` parameter instead).
     */
    getComputes?: (stateS: ReadonlySignal<TState>) => TComputes;
    /**
     * Function that receives action parameters and returns action functions.
     * For type inference, getActions must:
     * - be after getComputes.
     * - Not access the created store directly (use `params` instead).
     */
    getActions: (params: CreateSignalStoreActionParams<TState, TComputes>) => TActions;
    /**
     * When true, skips deep equality check before setting state (default: false)
     * This can be useful for performance reasons, but it is not recommended for complex state objects.
     */
    disableSetValidation?: boolean;
};
