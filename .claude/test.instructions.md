## Test conventions

- Test file location: `src/__tests__/{module}.test.ts` or `src/__tests__/{Component}.test.tsx`
- Framework: Vitest + React Testing Library
- One assertion per `it()` block — no multi-assertion tests
- Test naming: `"should {do thing} when {condition}"` — readable as documentation
- Never mock the module under test — mock only external dependencies (StorageAdapter, GitHub API)
- Order: happy path first, then edge cases, then error cases
- Tests must pass before any card moves to Done

## Test structure

```ts
describe("moduleName", () => {
  describe("functionName", () => {
    it("should return notes when adapter returns data", async () => { ... });
    it("should return empty array when adapter returns nothing", async () => { ... });
    it("should throw when adapter rejects", async () => { ... });
  });
});
```

## What to mock

Mock at the adapter boundary — never mock internal component logic:

```ts
// mock the StorageAdapter, not the hook that uses it
const mockAdapter: StorageAdapter = {
  listNotes: vi.fn().mockResolvedValue([]),
  readNote: vi.fn().mockResolvedValue(''),
  saveNote: vi.fn().mockResolvedValue(undefined),
  deleteNote: vi.fn().mockResolvedValue(undefined),
};
```

Reset mocks between tests:

```ts
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Component tests

Use React Testing Library — query by role and label, not by class or test ID:

```tsx
// wrong
const button = container.querySelector('.save-button');

// right
const button = screen.getByRole('button', { name: /save/i });
```

Wrap components that need the adapter in a test provider:

```tsx
function renderWithAdapter(ui: ReactElement, adapter = mockAdapter) {
  return render(
    <AdapterContext.Provider value={adapter}>
      {ui}
    </AdapterContext.Provider>
  );
}
```

## Async tests

Always `await` async interactions and always use `findBy` (not `getBy`) for elements that appear asynchronously:

```tsx
// wrong — getBy throws immediately if element isn't there yet
const note = screen.getByText('My Note');

// right — findBy waits for the element
const note = await screen.findByText('My Note');
```

## What to test

- Every exported function and hook has at least one test
- Every code path that branches (if/else, try/catch, loading/error/success states) has a dedicated test
- Error cases assert the specific error message or UI state — not just that an error occurred
- Do not test implementation details — test observable results (rendered output, mock calls)
