/**
 * Type-level tests to validate that all necessary types are exported
 * and work correctly when imported from the package.
 *
 * This file uses vitest's type testing utilities.
 * Run with: vitest typecheck
 */

import type { ReadonlySignal, Signal } from "@preact/signals-core";
import { describe, expectTypeOf, it } from "vitest";
import {
    createSignalStore,
    type CreateSignalStoreActionParams,
    type CreateSignalStoreOptions,
    type SignalStore,
    type SignalStoreActions,
    type SignalStoreAdditionalProps,
    type SignalStoreComputes,
    type SignalStoreState,
} from "./index";

// Import all PUBLIC types - if any of these fail, a type is not exported

// Import the function export

// ============================================================================
// TEST: Verify INTERNAL types are NOT exported (these should cause errors if uncommented)
// ============================================================================

// @ts-expect-error - AnyFunction should NOT be exported (it's internal)
type _TestAnyFunctionNotExported = import("./index").AnyFunction;

// ============================================================================
// TEST: Verify all types are exported and usable
// ============================================================================

describe("Type Exports", () => {
    it("CreateSignalStoreActionParams should be usable", () => {
        type TestState = { count: number };
        type TestComputes = { doubled: ReadonlySignal<number> };

        expectTypeOf<CreateSignalStoreActionParams<TestState, TestComputes>>().toMatchObjectType<{
            get: () => TestState;
            set: (value: TestState) => void;
            update: (value: Partial<TestState>) => void;
            computes: TestComputes;
        }>();
    });

    it("CreateSignalStoreOptions should be usable", () => {
        type TestState = { count: number };
        type TestActions = { increment: () => void };
        type TestComputes = { doubled: ReadonlySignal<number> };

        expectTypeOf<CreateSignalStoreOptions<TestState, TestActions, TestComputes>>().toExtend<{
            name?: string;
            initialState: TestState | (() => TestState);
            getActions: (params: CreateSignalStoreActionParams<TestState, TestComputes>) => TestActions;
        }>();
    });

    it("SignalStore should be usable and extend Signal", () => {
        type TestState = { count: number };
        type TestActions = { increment: () => void };
        type TestComputes = { doubled: ReadonlySignal<number> };

        type TestStore = SignalStore<TestState, TestActions, TestComputes>;

        // Should extend Signal
        expectTypeOf<TestStore>().toExtend<Signal<TestState>>();

        // Should have additional properties
        expectTypeOf<TestStore["actions"]>().toEqualTypeOf<TestActions>();
        expectTypeOf<TestStore["computes"]>().toEqualTypeOf<TestComputes>();
        expectTypeOf<TestStore["setState"]>().toEqualTypeOf<(value: TestState) => void>();
        expectTypeOf<TestStore["updateState"]>().toEqualTypeOf<(value: Partial<TestState>) => void>();
    });

    it("SignalStoreState utility type should extract state", () => {
        type TestState = { count: number };
        type TestActions = { increment: () => void };
        type TestStore = SignalStore<TestState, TestActions>;

        expectTypeOf<SignalStoreState<TestStore>>().toEqualTypeOf<TestState>();
    });

    it("SignalStoreActions utility type should extract actions", () => {
        type TestState = { count: number };
        type TestActions = { increment: () => void };
        type TestStore = SignalStore<TestState, TestActions>;

        expectTypeOf<SignalStoreActions<TestStore>>().toEqualTypeOf<TestActions>();
    });

    it("SignalStoreComputes utility type should extract computes", () => {
        type TestState = { count: number };
        type TestActions = { increment: () => void };
        type TestComputes = { doubled: ReadonlySignal<number> };
        type TestStore = SignalStore<TestState, TestActions, TestComputes>;

        expectTypeOf<SignalStoreComputes<TestStore>>().toEqualTypeOf<TestComputes>();
    });

    it("SignalStoreAdditionalProps should be usable", () => {
        type TestState = { count: number };
        type TestActions = { increment: () => void };
        type TestComputes = { doubled: ReadonlySignal<number> };

        expectTypeOf<SignalStoreAdditionalProps<TestState, TestActions, TestComputes>>().toMatchObjectType<{
            name?: string;
            computes: TestComputes;
            actions: TestActions;
            setState: (value: TestState) => void;
            updateState: (value: Partial<TestState>) => void;
        }>();
    });
});

// ============================================================================
// TEST: Verify createSignalStore returns correctly typed store
// ============================================================================

describe("createSignalStore function", () => {
    it("should return a correctly typed SignalStore", () => {
        const store = createSignalStore({
            initialState: { count: 0 },
            getActions: ({ get, set, update }) => ({
                increment: () => update({ count: get().count + 1 }),
                reset: () => set({ count: 0 }),
            }),
        });

        // Verify the store type
        expectTypeOf(store).toExtend<SignalStore<{ count: number }, { increment: () => void; reset: () => void }>>();

        // Verify value type
        expectTypeOf(store.value).toEqualTypeOf<{ count: number }>();

        // Verify actions
        expectTypeOf(store.actions.increment).toEqualTypeOf<() => void>();
        expectTypeOf(store.actions.reset).toEqualTypeOf<() => void>();
    });

    it("should work with computes", () => {
        const store = createSignalStore({
            initialState: { count: 0 },
            getComputes: stateS => ({
                doubled: { value: stateS.value.count * 2 } as ReadonlySignal<number>,
            }),
            getActions: ({ get, set, computes }) => ({
                increment: () => set({ count: get().count + 1 }),
                getDoubled: () => computes.doubled.value,
            }),
        });

        expectTypeOf(store.computes.doubled).toExtend<ReadonlySignal<number>>();
        expectTypeOf(store.actions.getDoubled).toEqualTypeOf<() => number>();
    });
});
