export type Note = {
  path: string;
  title: string;
};

export type StorageAdapter = {
  listNotes: () => Promise<Note[]>;
  readNote: (path: string) => Promise<string>;
  saveNote: (path: string, content: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
};
