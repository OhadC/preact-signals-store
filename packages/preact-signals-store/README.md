# preact-signals-store

A lightweight, type-safe reactive state management library built on `@preact/signals-core`.

## Installation

```bash
# Using npm
npm install preact-signals-store @preact/signals-core

# Using pnpm
pnpm add preact-signals-store @preact/signals-core

# Using yarn
yarn add preact-signals-store @preact/signals-core
```

### With Preact

```bash
pnpm add preact-signals-store @preact/signals
```

### With React

```bash
pnpm add preact-signals-store @preact/signals-react
```

## API Reference

### `createSignalStore(options)`

Creates a reactive store with typed state, actions, and optional computed values.

#### Parameters

| Option                 | Type                                                                     | Required | Description                                                      |
| ---------------------- | ------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------- |
| `name`                 | `string`                                                                 | No       | Optional name for debugging and identification                   |
| `initialState`         | `TState \| () => TState`                                                 | Yes      | Initial state value or a function returning it                   |
| `getComputes`          | `(stateS: ReadonlySignal<TState>) => TComputes`                          | No       | Function to define computed signals                              |
| `getActions`           | `(params: CreateSignalStoreActionParams<TState, TComputes>) => TActions` | Yes      | Function to define actions                                       |
| `disableSetValidation` | `boolean`                                                                | No       | Skip deep equality check before setting state (default: `false`) |

#### Action Parameters

The `getActions` function receives an object with the following utilities:

| Property   | Type                               | Description                                                  |
| ---------- | ---------------------------------- | ------------------------------------------------------------ |
| `get`      | `() => TState`                     | Get current state without subscribing (uses `Signal.peek()`) |
| `set`      | `(value: TState) => void`          | Replace the entire state                                     |
| `update`   | `(value: Partial<TState>) => void` | Partially update the state (merges with current)             |
| `computes` | `TComputes`                        | Access to computed values defined in `getComputes`           |

#### Returns

A `SignalStore` object with the following properties:

| Property      | Type                               | Description                             |
| ------------- | ---------------------------------- | --------------------------------------- |
| `value`       | `TState`                           | Direct access to state value (reactive) |
| `actions`     | `TActions`                         | Object containing all defined actions   |
| `computes`    | `TComputes`                        | Object containing all computed signals  |
| `setState`    | `(value: TState) => void`          | Direct method to replace state          |
| `updateState` | `(value: Partial<TState>) => void` | Direct method to partially update state |
| `name`        | `string \| undefined`              | Store name if provided                  |

### Utility Types

#### `SignalStoreState<TStore>`

Extracts the state type from a `SignalStore`.

```typescript
const store = createSignalStore({...});
type State = SignalStoreState<typeof store>;
```

#### `SignalStoreActions<TStore>`

Extracts the actions type from a `SignalStore`.

```typescript
const store = createSignalStore({...});
type Actions = SignalStoreActions<typeof store>;
```

## Usage Examples

### Basic Counter Store

```typescript
import { createSignalStore } from "preact-signals-store";

const counterStore = createSignalStore({
    name: "counter",
    initialState: { count: 0 },
    getActions: ({ get, update }) => ({
        increment: () => update({ count: get().count + 1 }),
        decrement: () => update({ count: get().count - 1 }),
        reset: () => update({ count: 0 }),
        setCount: (value: number) => update({ count: value }),
    }),
});

// Usage
counterStore.actions.increment();
console.log(counterStore.value); // { count: 1 }
```

### Store with Computed Values

```typescript
import { computed } from "@preact/signals-core";
import { createSignalStore } from "preact-signals-store";

const cartStore = createSignalStore({
    initialState: {
        items: [] as Array<{ id: string; name: string; price: number; quantity: number }>,
        discount: 0,
    },
    getComputes: stateS => ({
        itemCount: computed(() => stateS.value.items.reduce((sum, item) => sum + item.quantity, 0)),
        subtotal: computed(() => stateS.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0)),
        total: computed(() => {
            const subtotal = stateS.value.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return subtotal * (1 - stateS.value.discount);
        }),
    }),
    getActions: ({ get, set }) => ({
        addItem: (item: { id: string; name: string; price: number }) => {
            const items = get().items;
            const existing = items.find(i => i.id === item.id);

            if (existing) {
                set({
                    ...get(),
                    items: items.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
                });
            } else {
                set({
                    ...get(),
                    items: [...items, { ...item, quantity: 1 }],
                });
            }
        },
        removeItem: (id: string) => {
            set({
                ...get(),
                items: get().items.filter(i => i.id !== id),
            });
        },
        setDiscount: (discount: number) => {
            set({ ...get(), discount });
        },
        clearCart: () => {
            set({ items: [], discount: 0 });
        },
    }),
});

// Usage
cartStore.actions.addItem({ id: "1", name: "Widget", price: 9.99 });
console.log(cartStore.computes.total.value); // 9.99
```

### Accessing Computed Values in Actions

```typescript
import { computed } from "@preact/signals-core";
import { createSignalStore } from "preact-signals-store";

const store = createSignalStore({
    initialState: { value: 5 },
    getComputes: stateS => ({
        doubled: computed(() => stateS.value.value * 2),
        tripled: computed(() => stateS.value.value * 3),
    }),
    getActions: ({ get, set, computes }) => ({
        setToDoubled: () => set({ value: computes.doubled.value }),
        setToTripled: () => set({ value: computes.tripled.value }),
        multiplyByComputed: () =>
            set({
                value: computes.doubled.value * computes.tripled.value,
            }),
    }),
});

console.log(store.value); // { value: 5 }
store.actions.setToDoubled();
console.log(store.value); // { value: 10 }
```

### Lazy Initial State

```typescript
import { createSignalStore } from "preact-signals-store";

// Using a function for lazy initialization
const userStore = createSignalStore({
    initialState: () => {
        // This runs only once when the store is created
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : { name: "", email: "" };
    },
    getActions: ({ get, set }) => ({
        setUser: (name: string, email: string) => set({ name, email }),
        clearUser: () => set({ name: "", email: "" }),
        persist: () => {
            localStorage.setItem("user", JSON.stringify(get()));
        },
    }),
});
```

### Using with Preact Components

```tsx
import { useSignal } from "@preact/signals";
import { createSignalStore } from "preact-signals-store";

const counterStore = createSignalStore({
    initialState: { count: 0 },
    getActions: ({ get, update }) => ({
        increment: () => update({ count: get().count + 1 }),
        decrement: () => update({ count: get().count - 1 }),
    }),
});

function Counter() {
    // The component re-renders when value changes
    const count = counterStore.value.count;

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={counterStore.actions.increment}>+</button>
            <button onClick={counterStore.actions.decrement}>-</button>
        </div>
    );
}
```

### Using with React Components

```tsx
import { useSignals } from "@preact/signals-react/runtime";
import { createSignalStore } from "preact-signals-store";

const counterStore = createSignalStore({
    initialState: { count: 0 },
    getActions: ({ get, update }) => ({
        increment: () => update({ count: get().count + 1 }),
        decrement: () => update({ count: get().count - 1 }),
    }),
});

function Counter() {
    useSignals(); // Enable signal integration

    return (
        <div>
            <p>Count: {counterStore.value.count}</p>
            <button onClick={counterStore.actions.increment}>+</button>
            <button onClick={counterStore.actions.decrement}>-</button>
        </div>
    );
}
```

## Features

### Deep Equality Checks

By default, the store performs deep equality checks before updating state. This prevents unnecessary signal updates when the new state is deeply equal to the current state:

```typescript
const store = createSignalStore({
    initialState: { count: 0 },
    getActions: ({ set }) => ({
        setCount: (count: number) => set({ count }),
    }),
});

store.actions.setCount(5);
const prevState = store.value;

store.actions.setCount(5); // Same value
console.log(store.value === prevState); // true - no update occurred
```

To disable this behavior:

```typescript
const store = createSignalStore({
    initialState: { count: 0 },
    disableSetValidation: true, // Disables deep equality check
    getActions: ({ set }) => ({
        setCount: (count: number) => set({ count }),
    }),
});
```

### Direct State Methods

The store provides `setState` and `updateState` methods for external state modifications:

```typescript
const store = createSignalStore({
    initialState: { count: 0, name: "test" },
    getActions: () => ({}),
});

// Replace entire state
store.setState({ count: 5, name: "new" });

// Partial update
store.updateState({ count: 10 });
console.log(store.value); // { count: 10, name: 'new' }
```

## TypeScript Support

The library is fully typed and provides excellent TypeScript support:

```typescript
import { createSignalStore, SignalStoreActions, SignalStoreState } from "preact-signals-store";

// Types are automatically inferred
const store = createSignalStore({
    initialState: { count: 0, name: "" },
    getActions: ({ get, update }) => ({
        increment: () => update({ count: get().count + 1 }),
        setName: (name: string) => update({ name }),
    }),
});

// Extract types for external use
type State = SignalStoreState<typeof store>;
// { count: number; name: string }

type Actions = SignalStoreActions<typeof store>;
// { increment: () => void; setName: (name: string) => void }
```

## License

ISC
