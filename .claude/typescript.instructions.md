## TypeScript conventions

- Strict TypeScript — no `any` unless unavoidable; when used, add a comment explaining why
- No implicit returns — all async functions explicitly declare their return type
- Named exports only — no default exports
- Functions do one thing — if a function needs a comment to explain what it does, split it
- No inline `TODO` comments — missing work goes on the board as a new task
- Error handling only at boundaries (adapter methods, route-level error boundaries) — internal functions throw, boundaries catch

## Naming conventions

- **Files:** `kebab-case.ts` / `kebab-case.tsx`
- **Components:** PascalCase filename and export — `NoteEditor.tsx`; return type is always `React.JSX.Element` (import React explicitly)
- **Hooks:** `use` prefix, camelCase — `useNotes`, `useAdapter`
- **Functions:** camelCase, verb first — `loadNote`, `saveNote`, `buildPath`
- **Types:** PascalCase — `Note`, `StorageAdapter`, `AdapterConfig`; prefer `type` over `interface` unless extending
- **Constants:** camelCase if module-scoped, `UPPER_SNAKE_CASE` only for true global constants
- **Boolean variables:** prefix with `is`, `has`, or `should` — `isLoading`, `hasUnsavedChanges`

## File structure

```
src/
├── adapters/            ← StorageAdapter interface + one file per adapter
├── components/          ← shared UI components, no route logic
├── routes/              ← one file per route
├── hooks/               ← custom React hooks
├── context/             ← React context providers
├── styles/              ← global CSS and design tokens
├── types.ts             ← shared types used across multiple modules
├── main.tsx             ← entry point
└── App.tsx              ← router wrapper
```

- Components stay dumb — they receive props and call callbacks, no direct adapter access
- Adapter access goes through `useAdapter()` hook from context — never import a concrete adapter in a component
- Each file has one clear responsibility

## React patterns

- Functional components only — no class components
- Co-locate state as close to where it's used as possible; lift only when necessary
- Custom hooks for any logic that involves `useEffect`, data fetching, or shared state
- Avoid `useEffect` for derived state — compute it during render instead

```tsx
// wrong — useEffect for derived state
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// right — computed during render
const fullName = `${first} ${last}`;
```

## Async patterns

- Always `async/await` — no `.then()/.catch()` chains
- Use `Promise.all()` for independent concurrent operations
- Never `await` inside a loop — collect promises and `Promise.all()` them

## CSS

- SCSS modules (`Component.module.scss`) for component-scoped styles
- Global design tokens in `src/styles/tokens.scss` as CSS custom properties
- Shared variables (colours, spacing, typography) in `src/styles/_variables.scss` — import with `@use '../styles/variables' as *`
- Never use inline styles except for truly dynamic values (e.g. calculated widths)
- No CSS-in-JS, no Tailwind
