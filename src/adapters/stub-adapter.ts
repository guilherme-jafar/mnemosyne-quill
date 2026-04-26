import type { Note, StorageAdapter } from "./storage-adapter";

const STUB_NOTES: Note[] = [
  { path: "README.md", title: "README" },
  { path: "Meetings/2024-01-standup.md", title: "January Standup" },
  { path: "Meetings/2024-02-retrospective.md", title: "February Retrospective" },
  { path: "Projects/quill/architecture.md", title: "Architecture" },
  { path: "Projects/quill/roadmap.md", title: "Roadmap" },
  { path: "Books/atomic-habits.md", title: "Atomic Habits" },
  { path: "Books/deep-work.md", title: "Deep Work" },
];

const STUB_CONTENT: Record<string, string> = {
  "README.md": `# Welcome to Mnemosyne Quill\n\nConnect a storage adapter in Settings to load your own notes.\n`,
};

export const stubAdapter: StorageAdapter = {
  listNotes: async (): Promise<Note[]> => STUB_NOTES,

  readNote: async (path: string): Promise<string> =>
    STUB_CONTENT[path] ?? `# ${path}\n\nNote content goes here.\n`,

  saveNote: async (): Promise<void> => {
    // no-op in stub
  },

  deleteNote: async (): Promise<void> => {
    // no-op in stub
  },
};
