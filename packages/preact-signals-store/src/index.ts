import { Signal, type ReadonlySignal } from "@preact/signals-core";

/**
 * Generic function type used for actions in the signal store.
 * @internal
 */
type AnyFunction = (...args: any[]) => any;

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
type SignalStoreAdditionalProps<TState, TActions, TComputes> = {
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
 * Creates a reactive signal-based store with typed state, actions, and optional computed values.
 *
 * This function creates a store that leverages `@preact/signals-core` for reactive state management.
 * The store automatically handles deep equality checks to prevent unnecessary re-renders and
 * provides a clean API for defining actions and computed values.
 *
 * @typeParam TState - The shape of the store's state object
 * @typeParam TActions - The shape of the actions object (inferred from `getActions`)
 * @typeParam TComputes - The shape of computed values object (inferred from `getComputes`)
 *
 * @param options - Configuration object for the store
 * @param options.name - Optional name for debugging and identification
 * @param options.initialState - The initial state value, or a function that returns the initial state
 * @param options.getComputes - Optional function that receives the state signal and returns computed signals
 * @param options.getActions - Function that receives action parameters and returns action functions
 * @param options.disableSetValidation - When true, skips deep equality check before setting state (default: false)
 *
 * @returns A SignalStore instance with state, actions, computed values, and utility methods
 *
 * @example
 * ```typescript
 * import { createSignalStore } from 'preact-signals-store';
 * import { computed } from '@preact/signals-core';
 *
 * // Basic counter store
 * const counterStore = createSignalStore({
 *   name: 'counter',
 *   initialState: { count: 0 },
 *   getActions: ({ get, update }) => ({
 *     increment: () => update({ count: get().count + 1 }),
 *     decrement: () => update({ count: get().count - 1 }),
 *     reset: () => update({ count: 0 }),
 *   }),
 * });
 *
 * // Using the store
 * counterStore.actions.increment();
 * console.log(counterStore.value); // { count: 1 }
 * ```
 *
 * @example
 * ```typescript
 * // Store with computed values
 * const todoStore = createSignalStore({
 *   initialState: {
 *     todos: [] as { id: number; text: string; done: boolean }[],
 *   },
 *   getComputes: (stateS) => ({
 *     completedCount: computed(() =>
 *       stateS.value.todos.filter(t => t.done).length
 *     ),
 *     pendingCount: computed(() =>
 *       stateS.value.todos.filter(t => !t.done).length
 *     ),
 *   }),
 *   getActions: ({ get, set }) => ({
 *     addTodo: (text: string) => set({
 *       todos: [...get().todos, { id: Date.now(), text, done: false }],
 *     }),
 *     toggleTodo: (id: number) => set({
 *       todos: get().todos.map(t =>
 *         t.id === id ? { ...t, done: !t.done } : t
 *       ),
 *     }),
 *   }),
 * });
 *
 * // Access computed values
 * console.log(todoStore.computes.completedCount.value); // 0
 * ```
 *
 * @example
 * ```typescript
 * // Using initialState as a function (useful for lazy initialization)
 * const store = createSignalStore({
 *   initialState: () => ({
 *     data: loadFromLocalStorage() ?? defaultData,
 *   }),
 *   getActions: ({ set }) => ({
 *     clear: () => set({ data: null }),
 *   }),
 * });
 * ```
 */
export function createSignalStore<
    TState,
    TActions extends Record<string, AnyFunction>,
    TComputes extends Record<string, ReadonlySignal<any>> = Record<never, never>,
>({
    name,
    initialState,
    getComputes,
    getActions,
    disableSetValidation = false,
}: {
    name?: string;
    initialState: TState | (() => TState);
    getComputes?: (stateS: ReadonlySignal<TState>) => TComputes;
    getActions: (params: CreateSignalStoreActionParams<TState, TComputes>) => TActions;
    disableSetValidation?: boolean;
}): SignalStore<TState, TActions, TComputes> {
    const stateS = createInitialSignal(initialState);

    const computes = getComputes?.(stateS) ?? ({} as TComputes);

    const actionParameters: CreateSignalStoreActionParams<TState, TComputes> = {
        get: () => stateS.peek(),
        set: (value: TState) => {
            if (!disableSetValidation && deepEqual(stateS.peek(), value)) {
                return;
            }

            stateS.value = value;
        },
        update: (value: Partial<TState>) => {
            const nextState = typeof value !== "object" || value === null ? (value as TState) : Object.assign({}, stateS.peek(), value);

            return actionParameters.set(nextState);
        },
        computes,
    };

    const actions = getActions(actionParameters);
    const setState = actionParameters.set;
    const updateState = actionParameters.update;

    Object.assign(stateS, {
        name,
        computes,
        actions,
        setState,
        updateState,
    });

    return stateS as SignalStore<TState, TActions, TComputes>;
}

function createInitialSignal<TState>(initialState: TState | (() => TState)): Signal<TState> {
    // This function is necessary to avoid saving the initial state data in the store closure (in case it is a function) - avoid memory leaks

    const initialStateValue = isFunction(initialState) ? initialState() : initialState;

    return new Signal(initialStateValue);
}

function isFunction(value: unknown): value is AnyFunction {
    return typeof value === "function";
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }

    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
            return false;
        }
    }

    return true;
}
