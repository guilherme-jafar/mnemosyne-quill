# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

@.claude/typescript.instructions.md
@.claude/test.instructions.md

## What this is

Mnemosyne Quill is an open source, Quartz-inspired note viewer and editor. Users connect it to a notes storage backend of their choice (GitHub repo, local filesystem) and get a browser-based interface to read and edit their Markdown notes — with the Quartz look and feel they already know.

The editor uses **Milkdown** (WYSIWYG, Markdown-first — the document IS Markdown internally, no conversion on save). Notes stay as plain `.md` files, readable in Obsidian or renderable by Quartz without any post-processing.

This is the open source project. It has no authentication and no proprietary backend. The Mnemosyne paid app is a private fork that adds the `MnemosyneAdapter`, OTP auth, and Mnemosyne-specific features.

## Commands

```bash
npm run dev      # start local dev server (Vite HMR)
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm run lint     # ESLint
npm run test     # Vitest
```

## Architecture

### StorageAdapter

The entire frontend is decoupled from any backend via a single interface:

```typescript
interface StorageAdapter {
  listNotes(): Promise<Note[]>
  readNote(path: string): Promise<string>
  saveNote(path: string, content: string): Promise<void>
  deleteNote(path: string): Promise<void>
}
```

Adapters live in `src/adapters/`. The app is initialised with one adapter (chosen at startup from user config). No component ever imports a concrete adapter directly — they receive it via context.

**Shipped adapters:**
- `GitHubAdapter` — reads/writes via GitHub API using a user-supplied PAT
- `LocalAdapter` — reads/writes local files (for desktop/dev use)
- `StubAdapter` — in-memory stub used during development and tests

### File structure

```
src/
├── adapters/
│   ├── storage-adapter.ts   ← StorageAdapter interface + Note type
│   ├── github-adapter.ts
│   ├── local-adapter.ts
│   └── stub-adapter.ts
├── components/              ← shared UI components (no route logic)
├── routes/                  ← one file per route
│   ├── home.tsx
│   ├── note-editor.tsx
│   └── settings.tsx
├── hooks/                   ← custom React hooks
├── context/
│   └── adapter-context.tsx  ← provides StorageAdapter to the tree
├── styles/                  ← global SCSS and Quartz design tokens
│   ├── tokens.scss          ← CSS custom properties (--font-body, --color-text, etc.)
│   └── _variables.scss      ← SCSS variables shared across modules
├── types.ts                 ← shared types
├── main.tsx                 ← entry point
└── App.tsx                  ← router wrapper
```

## Tech stack

- **Vite** — build tool and dev server
- **React 18** + **TypeScript** (strict)
- **React Router v6** — client-side routing
- **Milkdown** — WYSIWYG Markdown editor (`@milkdown/core`, `@milkdown/react`, `@milkdown/preset-commonmark`)
- **Vitest** + **React Testing Library** — tests
- SCSS modules — no component library, no Tailwind

## Design

Quartz-inspired: same typography (Inter for UI, JetBrains Mono for code), same colour palette (light/dark), same sidebar + content panel layout. Styles live in `src/styles/` as SCSS — global tokens in `tokens.scss`, shared variables in `_variables.scss`, component styles in `.module.scss` files. Do not introduce a CSS-in-JS library or utility class framework.

## Working rules

**No code without discussion.** Before touching any file, present the full plan: which files change, what changes, and why. Wait for explicit approval before implementing. This rule has no exceptions.
