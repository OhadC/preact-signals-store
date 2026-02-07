import { computed, effect } from "@preact/signals-core";
import { describe, expect, it, vi } from "vitest";
import { createSignalStore } from "./index";

describe("createSignalStore", () => {
    // ============================================
    // BASIC STORE CREATION
    // ============================================
    describe("Store Creation", () => {
        it("should create a store with initial state object", () => {
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

        it("should support optional store name", () => {
            const store = createSignalStore({
                name: "my-store",
                initialState: { count: 0 },
                getActions: () => ({}),
            });

            expect(store.name).toBe("my-store");
        });

        it("should have undefined name when not provided", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: () => ({}),
            });

            expect(store.name).toBeUndefined();
        });

        it("should create empty computes object when getComputes not provided", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: () => ({}),
            });

            expect(store.computes).toEqual({});
        });
    });

    // ============================================
    // ACTIONS - get, set, update
    // ============================================
    describe("Actions", () => {
        it("should update state via actions using update()", () => {
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

        it("should replace full state via actions using set()", () => {
            const store = createSignalStore({
                initialState: { count: 0, name: "test" },
                getActions: ({ set }) => ({
                    reset: () => set({ count: 0, name: "reset" }),
                }),
            });

            store.actions.reset();
            expect(store.value).toEqual({ count: 0, name: "reset" });
        });

        it("should support actions with parameters", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ get, update }) => ({
                    add: (amount: number) => update({ count: get().count + amount }),
                    setTo: (value: number) => update({ count: value }),
                }),
            });

            store.actions.add(5);
            expect(store.value.count).toBe(5);

            store.actions.add(3);
            expect(store.value.count).toBe(8);

            store.actions.setTo(100);
            expect(store.value.count).toBe(100);
        });

        it("should support actions with multiple parameters", () => {
            const store = createSignalStore({
                initialState: { x: 0, y: 0 },
                getActions: ({ update }) => ({
                    setPosition: (x: number, y: number) => update({ x, y }),
                }),
            });

            store.actions.setPosition(10, 20);
            expect(store.value).toEqual({ x: 10, y: 20 });
        });

        it("should support actions that return values", () => {
            const store = createSignalStore({
                initialState: { count: 5 },
                getActions: ({ get, update }) => ({
                    getAndIncrement: () => {
                        const current = get().count;
                        update({ count: current + 1 });
                        return current;
                    },
                    getCurrentCount: () => get().count,
                }),
            });

            const oldValue = store.actions.getAndIncrement();
            expect(oldValue).toBe(5);
            expect(store.value.count).toBe(6);

            expect(store.actions.getCurrentCount()).toBe(6);
        });

        it("should support async actions", async () => {
            const store = createSignalStore({
                initialState: { count: 0, loading: false },
                getActions: ({ get, update }) => ({
                    asyncIncrement: async () => {
                        update({ loading: true });
                        await new Promise(resolve => setTimeout(resolve, 10));
                        update({ count: get().count + 1, loading: false });
                    },
                }),
            });

            expect(store.value).toEqual({ count: 0, loading: false });

            const promise = store.actions.asyncIncrement();
            expect(store.value.loading).toBe(true);

            await promise;
            expect(store.value).toEqual({ count: 1, loading: false });
        });

        it("should allow get() to read current state without triggering reactivity", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ get, update }) => ({
                    doubleIt: () => {
                        const current = get();
                        update({ count: current.count * 2 });
                    },
                }),
            });

            store.updateState({ count: 5 });
            store.actions.doubleIt();
            expect(store.value.count).toBe(10);
        });
    });

    // ============================================
    // DIRECT STATE METHODS - setState, updateState
    // ============================================
    describe("Direct State Methods", () => {
        it("should have setState method for full state replacement", () => {
            const store = createSignalStore({
                initialState: { count: 0, name: "test" },
                getActions: () => ({}),
            });

            store.setState({ count: 5, name: "new" });
            expect(store.value).toEqual({ count: 5, name: "new" });
        });

        it("should have updateState method for partial updates", () => {
            const store = createSignalStore({
                initialState: { count: 0, name: "test" },
                getActions: () => ({}),
            });

            store.updateState({ count: 10 });
            expect(store.value).toEqual({ count: 10, name: "test" });

            store.updateState({ name: "updated" });
            expect(store.value).toEqual({ count: 10, name: "updated" });
        });
    });

    // ============================================
    // COMPUTED VALUES
    // ============================================
    describe("Computed Values", () => {
        it("should support single computed value", () => {
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

        it("should support multiple computed values", () => {
            const store = createSignalStore({
                initialState: { count: 10 },
                getComputes: stateS => ({
                    doubled: computed(() => stateS.value.count * 2),
                    squared: computed(() => stateS.value.count ** 2),
                    isPositive: computed(() => stateS.value.count > 0),
                }),
                getActions: ({ update, get }) => ({
                    setCount: (count: number) => update({ count }),
                }),
            });

            expect(store.computes.doubled.value).toBe(20);
            expect(store.computes.squared.value).toBe(100);
            expect(store.computes.isPositive.value).toBe(true);

            store.actions.setCount(-5);
            expect(store.computes.doubled.value).toBe(-10);
            expect(store.computes.squared.value).toBe(25);
            expect(store.computes.isPositive.value).toBe(false);
        });

        it("should support computed values derived from other computed values", () => {
            const store = createSignalStore({
                initialState: { count: 5 },
                getComputes: stateS => {
                    const doubled = computed(() => stateS.value.count * 2);
                    const quadrupled = computed(() => doubled.value * 2);
                    return { doubled, quadrupled };
                },
                getActions: ({ update, get }) => ({
                    increment: () => update({ count: get().count + 1 }),
                }),
            });

            expect(store.computes.doubled.value).toBe(10);
            expect(store.computes.quadrupled.value).toBe(20);

            store.actions.increment();
            expect(store.computes.doubled.value).toBe(12);
            expect(store.computes.quadrupled.value).toBe(24);
        });

        it("should allow access to computes from actions", () => {
            const store = createSignalStore({
                initialState: { count: 5 },
                getComputes: stateS => ({
                    doubled: computed(() => stateS.value.count * 2),
                }),
                getActions: ({ update, computes }) => ({
                    setToDoubled: () => update({ count: computes.doubled.value }),
                }),
            });

            expect(store.value.count).toBe(5);
            store.actions.setToDoubled();
            expect(store.value.count).toBe(10);
        });

        it("should support complex computed values with arrays", () => {
            const store = createSignalStore({
                initialState: {
                    todos: [
                        { id: 1, text: "Task 1", done: true },
                        { id: 2, text: "Task 2", done: false },
                        { id: 3, text: "Task 3", done: true },
                    ],
                },
                getComputes: stateS => ({
                    completedCount: computed(() => stateS.value.todos.filter(t => t.done).length),
                    pendingCount: computed(() => stateS.value.todos.filter(t => !t.done).length),
                    allDone: computed(() => stateS.value.todos.every(t => t.done)),
                }),
                getActions: ({ get, set }) => ({
                    toggleTodo: (id: number) =>
                        set({
                            todos: get().todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
                        }),
                }),
            });

            expect(store.computes.completedCount.value).toBe(2);
            expect(store.computes.pendingCount.value).toBe(1);
            expect(store.computes.allDone.value).toBe(false);

            store.actions.toggleTodo(2);
            expect(store.computes.completedCount.value).toBe(3);
            expect(store.computes.pendingCount.value).toBe(0);
            expect(store.computes.allDone.value).toBe(true);
        });
    });

    // ============================================
    // DEEP EQUALITY & SET VALIDATION
    // ============================================
    describe("Deep Equality Checks", () => {
        it("should not update when value is deeply equal (reference preserved)", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ set }) => ({
                    setCount: (count: number) => set({ count }),
                }),
            });

            store.actions.setCount(5);
            const prevState = store.value;

            store.actions.setCount(5); // same value
            expect(store.value).toBe(prevState); // reference should be same
        });

        it("should handle deep equality with nested objects", () => {
            const store = createSignalStore({
                initialState: {
                    user: { name: "John", age: 30 },
                    settings: { theme: "dark" },
                },
                getActions: ({ set }) => ({
                    setUser: (user: { name: string; age: number }) => set({ ...store.value, user }),
                }),
            });

            const prevState = store.value;
            store.setState({ user: { name: "John", age: 30 }, settings: { theme: "dark" } });
            expect(store.value).toBe(prevState); // deeply equal, no update
        });

        it("should update when nested values differ", () => {
            const store = createSignalStore({
                initialState: {
                    user: { name: "John", age: 30 },
                },
                getActions: () => ({}),
            });

            const prevState = store.value;
            store.setState({ user: { name: "John", age: 31 } });
            expect(store.value).not.toBe(prevState);
            expect(store.value.user.age).toBe(31);
        });

        it("should handle deep equality with arrays", () => {
            const store = createSignalStore({
                initialState: { items: [1, 2, 3] },
                getActions: () => ({}),
            });

            const prevState = store.value;
            store.setState({ items: [1, 2, 3] }); // deeply equal array
            expect(store.value).toBe(prevState);
        });

        it("should update when array elements differ", () => {
            const store = createSignalStore({
                initialState: { items: [1, 2, 3] },
                getActions: () => ({}),
            });

            const prevState = store.value;
            store.setState({ items: [1, 2, 4] });
            expect(store.value).not.toBe(prevState);
        });

        it("should update when array length differs", () => {
            const store = createSignalStore({
                initialState: { items: [1, 2, 3] },
                getActions: () => ({}),
            });

            const prevState = store.value;
            store.setState({ items: [1, 2, 3, 4] });
            expect(store.value).not.toBe(prevState);
        });
    });

    describe("disableSetValidation option", () => {
        it("should skip deep equality check when disableSetValidation is true", () => {
            const store = createSignalStore({
                initialState: { count: 5 },
                getActions: ({ set }) => ({
                    setCount: (count: number) => set({ count }),
                }),
                disableSetValidation: true,
            });

            const prevState = store.value;
            store.actions.setCount(5); // same value
            expect(store.value).not.toBe(prevState); // reference should be different
            expect(store.value.count).toBe(5);
        });

        it("should always update state when disableSetValidation is true", () => {
            let updateCount = 0;
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ set, get }) => ({
                    setCount: (count: number) => {
                        updateCount++;
                        set({ count });
                    },
                }),
                disableSetValidation: true,
            });

            // Subscribe to track actual signal updates
            const values: number[] = [];
            effect(() => {
                values.push(store.value.count);
            });

            store.actions.setCount(1);
            store.actions.setCount(1); // same value
            store.actions.setCount(1); // same value again

            expect(values).toEqual([0, 1, 1, 1]); // all updates went through
        });
    });

    // ============================================
    // REACTIVITY
    // ============================================
    describe("Signal Reactivity", () => {
        it("should trigger effects when state changes", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ update, get }) => ({
                    increment: () => update({ count: get().count + 1 }),
                }),
            });

            const values: number[] = [];
            effect(() => {
                values.push(store.value.count);
            });

            store.actions.increment();
            store.actions.increment();
            store.actions.increment();

            expect(values).toEqual([0, 1, 2, 3]);
        });

        it("should not trigger effects when same value is set (deep equality)", () => {
            const store = createSignalStore({
                initialState: { count: 5 },
                getActions: ({ set }) => ({
                    setCount: (count: number) => set({ count }),
                }),
            });

            const values: number[] = [];
            effect(() => {
                values.push(store.value.count);
            });

            store.actions.setCount(5); // same value
            store.actions.setCount(5); // same value

            expect(values).toEqual([5]); // no additional triggers
        });

        it("should trigger computed effects when dependencies change", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getComputes: stateS => ({
                    doubled: computed(() => stateS.value.count * 2),
                }),
                getActions: ({ update, get }) => ({
                    increment: () => update({ count: get().count + 1 }),
                }),
            });

            const doubledValues: number[] = [];
            effect(() => {
                doubledValues.push(store.computes.doubled.value);
            });

            store.actions.increment();
            store.actions.increment();

            expect(doubledValues).toEqual([0, 2, 4]);
        });
    });

    // ============================================
    // COMPLEX STATE TYPES
    // ============================================
    describe("Complex State Types", () => {
        it("should handle nested object state", () => {
            const store = createSignalStore({
                initialState: {
                    user: {
                        profile: {
                            name: "John",
                            address: {
                                city: "NYC",
                                zip: "10001",
                            },
                        },
                    },
                },
                getActions: ({ get, set }) => ({
                    updateCity: (city: string) =>
                        set({
                            user: {
                                profile: {
                                    ...get().user.profile,
                                    address: {
                                        ...get().user.profile.address,
                                        city,
                                    },
                                },
                            },
                        }),
                }),
            });

            store.actions.updateCity("LA");
            expect(store.value.user.profile.address.city).toBe("LA");
            expect(store.value.user.profile.address.zip).toBe("10001");
        });

        it("should handle array of objects state", () => {
            interface Todo {
                id: number;
                text: string;
                done: boolean;
            }

            const store = createSignalStore({
                initialState: { todos: [] as Todo[] },
                getActions: ({ get, set }) => ({
                    addTodo: (text: string) =>
                        set({
                            todos: [...get().todos, { id: Date.now(), text, done: false }],
                        }),
                    removeTodo: (id: number) =>
                        set({
                            todos: get().todos.filter(t => t.id !== id),
                        }),
                    toggleTodo: (id: number) =>
                        set({
                            todos: get().todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
                        }),
                }),
            });

            const id1 = Date.now();
            vi.useFakeTimers();
            vi.setSystemTime(id1);

            store.actions.addTodo("Task 1");
            expect(store.value.todos).toHaveLength(1);
            expect(store.value.todos[0].text).toBe("Task 1");

            vi.setSystemTime(id1 + 1);
            store.actions.addTodo("Task 2");
            expect(store.value.todos).toHaveLength(2);

            store.actions.toggleTodo(id1);
            expect(store.value.todos[0].done).toBe(true);

            store.actions.removeTodo(id1);
            expect(store.value.todos).toHaveLength(1);
            expect(store.value.todos[0].text).toBe("Task 2");

            vi.useRealTimers();
        });

        it("should handle Map-like state (using object)", () => {
            const store = createSignalStore({
                initialState: {
                    cache: {} as Record<string, { data: string; timestamp: number }>,
                },
                getActions: ({ get, set }) => ({
                    setCache: (key: string, data: string) =>
                        set({
                            cache: {
                                ...get().cache,
                                [key]: { data, timestamp: Date.now() },
                            },
                        }),
                    removeCache: (key: string) => {
                        const { [key]: _, ...rest } = get().cache;
                        set({ cache: rest });
                    },
                }),
            });

            store.actions.setCache("user:1", "John");
            expect(store.value.cache["user:1"].data).toBe("John");

            store.actions.setCache("user:2", "Jane");
            expect(Object.keys(store.value.cache)).toHaveLength(2);

            store.actions.removeCache("user:1");
            expect(store.value.cache["user:1"]).toBeUndefined();
            expect(store.value.cache["user:2"].data).toBe("Jane");
        });

        it("should handle null and undefined values in state", () => {
            const store = createSignalStore({
                initialState: {
                    nullableValue: null as string | null,
                    optionalValue: undefined as string | undefined,
                },
                getActions: ({ update }) => ({
                    setNullable: (value: string | null) => update({ nullableValue: value }),
                    setOptional: (value: string | undefined) => update({ optionalValue: value }),
                }),
            });

            expect(store.value.nullableValue).toBeNull();
            expect(store.value.optionalValue).toBeUndefined();

            store.actions.setNullable("hello");
            expect(store.value.nullableValue).toBe("hello");

            store.actions.setNullable(null);
            expect(store.value.nullableValue).toBeNull();

            store.actions.setOptional("world");
            expect(store.value.optionalValue).toBe("world");

            store.actions.setOptional(undefined);
            expect(store.value.optionalValue).toBeUndefined();
        });
    });

    // ============================================
    // EDGE CASES
    // ============================================
    describe("Edge Cases", () => {
        it("should handle empty initial state object", () => {
            const store = createSignalStore({
                initialState: {},
                getActions: ({ update }) => ({
                    addProperty: () => update({ newProp: "value" } as any),
                }),
            });

            expect(store.value).toEqual({});
            store.actions.addProperty();
            expect(store.value).toEqual({ newProp: "value" });
        });

        it("should handle primitive-like behavior in update", () => {
            // The implementation has special handling when update receives a non-object or null
            const store = createSignalStore({
                initialState: { value: 5 },
                getActions: ({ get, update }) => ({
                    increment: () => update({ value: get().value + 1 }),
                }),
            });

            store.actions.increment();
            expect(store.value.value).toBe(6);
        });

        it("should handle rapid sequential updates", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ get, update }) => ({
                    increment: () => update({ count: get().count + 1 }),
                }),
            });

            for (let i = 0; i < 100; i++) {
                store.actions.increment();
            }

            expect(store.value.count).toBe(100);
        });

        it("should maintain action reference stability", () => {
            const store = createSignalStore({
                initialState: { count: 0 },
                getActions: ({ update, get }) => ({
                    increment: () => update({ count: get().count + 1 }),
                }),
            });

            const incrementRef = store.actions.increment;
            store.actions.increment();

            expect(store.actions.increment).toBe(incrementRef);
        });

        it("should handle store used inside another computed", () => {
            const store1 = createSignalStore({
                initialState: { count: 5 },
                getActions: ({ update, get }) => ({
                    increment: () => update({ count: get().count + 1 }),
                }),
            });

            const store2 = createSignalStore({
                initialState: { multiplier: 2 },
                getComputes: stateS => ({
                    combined: computed(() => store1.value.count * stateS.value.multiplier),
                }),
                getActions: ({ update }) => ({
                    setMultiplier: (m: number) => update({ multiplier: m }),
                }),
            });

            expect(store2.computes.combined.value).toBe(10);

            store1.actions.increment();
            expect(store2.computes.combined.value).toBe(12);

            store2.actions.setMultiplier(3);
            expect(store2.computes.combined.value).toBe(18);
        });
    });

    // ============================================
    // TYPE INFERENCE (compile-time checks)
    // ============================================
    describe("Type Safety", () => {
        it("should properly type state", () => {
            interface State {
                count: number;
                name: string;
            }

            const store = createSignalStore({
                initialState: { count: 0, name: "test" } as State,
                getActions: ({ get, update }) => ({
                    increment: () => update({ count: get().count + 1 }),
                    setName: (name: string) => update({ name }),
                }),
            });

            // These should compile without errors
            const count: number = store.value.count;
            const name: string = store.value.name;
            store.actions.increment();
            store.actions.setName("new name");

            expect(count).toBe(0);
            expect(name).toBe("test");
        });

        it("should properly type computed values", () => {
            const store = createSignalStore({
                initialState: { count: 5 },
                getComputes: stateS => ({
                    doubled: computed(() => stateS.value.count * 2),
                    isEven: computed(() => stateS.value.count % 2 === 0),
                }),
                getActions: () => ({}),
            });

            // These should compile without errors
            const doubled: number = store.computes.doubled.value;
            const isEven: boolean = store.computes.isEven.value;

            expect(doubled).toBe(10);
            expect(isEven).toBe(false);
        });
    });
});
