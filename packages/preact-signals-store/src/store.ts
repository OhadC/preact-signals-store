import { Signal, type ReadonlySignal } from "@preact/signals-core";
import type { CreateSignalStoreActionParams, CreateSignalStoreOptions, SignalStore } from "./types";
import { AnyFunction } from "./utils/types-utils";
import { deepEqual, isFunction } from "./utils/utils";

/**
 * Creates a reactive signal-based store with typed state, actions, and optional computed values.
 *
 * This function creates a store that leverages `@preact/signals-core` for reactive state management.
 * The store automatically handles deep equality checks to prevent unnecessary re-renders and
 * provides a clean API for defining actions and computed values.
 *
 * @param options - Configuration object for the store. See {@link CreateSignalStoreOptions}.
 * @returns A SignalStore instance with state, actions, computed values, and utility methods
 *
 * @example
 * ```typescript
 * // Basic counter store
 * const counterStore = createSignalStore({
 *   name: 'counter',
 *   initialState: { count: 0 },
 *   getActions: ({ get, update }) => ({
 *     increment: () => update({ count: get().count + 1 }),
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
}: CreateSignalStoreOptions<TState, TActions, TComputes>): SignalStore<TState, TActions, TComputes> {
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

/**
 * This function is necessary to avoid saving the initial state data in the store closure (in case it is a function) - avoid memory leaks
 */
function createInitialSignal<TState>(initialState: TState | (() => TState)): Signal<TState> {
    const initialStateValue = isFunction(initialState) ? initialState() : initialState;

    return new Signal(initialStateValue);
}
