import { computed } from "@preact/signals-core";
import { createSignalStore } from "preact-signals-store";
import { describe, expect, it } from "vitest";

describe("createSignalStore with @preact/signals-core", () => {
    it("should create a store with initial state", () => {
        const store = createSignalStore({
            initialState: { count: 0 },
            getActions: () => ({}),
        });

        expect(store.value).toEqual({ count: 0 });
    });

    it("should create a store with initialState as function", () => {
        const store = createSignalStore({
            initialState: () => ({ count: 5 }),
            getActions: () => ({}),
        });

        expect(store.value).toEqual({ count: 5 });
    });

    it("should update state via actions", () => {
        const store = createSignalStore({
            initialState: { count: 0 },
            getActions: ({ get, update }) => ({
                increment: () => update({ count: get().count + 1 }),
                decrement: () => update({ count: get().count - 1 }),
            }),
        });

        expect(store.value.count).toBe(0);

        store.actions.increment();
        expect(store.value.count).toBe(1);

        store.actions.increment();
        expect(store.value.count).toBe(2);

        store.actions.decrement();
        expect(store.value.count).toBe(1);
    });

    it("should support set for full state replacement", () => {
        const store = createSignalStore({
            initialState: { count: 0, name: "test" },
            getActions: ({ set }) => ({
                reset: () => set({ count: 0, name: "reset" }),
            }),
        });

        store.actions.reset();
        expect(store.value).toEqual({ count: 0, name: "reset" });
    });

    it("should support computed values", () => {
        const store = createSignalStore({
            initialState: { count: 5 },
            getComputes: stateS => ({
                doubled: computed(() => stateS.value.count * 2),
            }),
            getActions: ({ update, get }) => ({
                increment: () => update({ count: get().count + 1 }),
            }),
        });

        expect(store.computes.doubled.value).toBe(10);

        store.actions.increment();
        expect(store.computes.doubled.value).toBe(12);
    });

    it("should allow access to computes from actions", () => {
        const store = createSignalStore({
            initialState: { count: 5 },
            getComputes: stateS => ({
                doubled: computed(() => stateS.value.count * 2),
            }),
            getActions: ({ update, get, computes }) => ({
                setToDoubled: () => update({ count: computes.doubled.value }),
            }),
        });

        expect(store.value.count).toBe(5);
        store.actions.setToDoubled();
        expect(store.value.count).toBe(10);
    });

    it("should have updateState and setState methods", () => {
        const store = createSignalStore({
            initialState: { count: 0, name: "test" },
            getActions: () => ({}),
        });

        store.setState({ count: 5, name: "new" });
        expect(store.value).toEqual({ count: 5, name: "new" });

        store.updateState({ count: 10 });
        expect(store.value).toEqual({ count: 10, name: "new" });
    });

    it("should not update when value is deeply equal", () => {
        let updateCount = 0;
        const store = createSignalStore({
            initialState: { count: 0 },
            getActions: ({ set, get }) => ({
                setCount: (count: number) => {
                    updateCount++;
                    set({ count });
                },
                getCount: () => get().count,
            }),
        });

        store.actions.setCount(5);
        expect(store.value.count).toBe(5);

        const prevState = store.value;
        store.actions.setCount(5); // same value
        expect(store.value).toBe(prevState); // reference should be same
    });

    it("should support store name", () => {
        const store = createSignalStore({
            name: "my-store",
            initialState: { count: 0 },
            getActions: () => ({}),
        });

        expect(store.name).toBe("my-store");
    });
});
