import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalAdapter } from "../adapters/local-adapter";

vi.mock("idb", () => ({
  openDB: vi.fn().mockResolvedValue({
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
  }),
}));

const makeFileHandle = (name: string, content: string): FileSystemFileHandle =>
  ({
    kind: "file",
    name,
    getFile: vi.fn().mockResolvedValue(
      new File([content], name, { type: "text/markdown" })
    ),
    createWritable: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  }) as unknown as FileSystemFileHandle;

const makeDirHandle = (
  entries: [string, FileSystemHandle][]
): FileSystemDirectoryHandle =>
  ({
    kind: "directory",
    queryPermission: vi.fn().mockResolvedValue("granted"),
    requestPermission: vi.fn().mockResolvedValue("granted"),
    getDirectoryHandle: vi.fn(),
    getFileHandle: vi.fn(),
    removeEntry: vi.fn().mockResolvedValue(undefined),
    [Symbol.asyncIterator]: vi.fn().mockImplementation(async function* () {
      for (const entry of entries) yield entry;
    }),
  }) as unknown as FileSystemDirectoryHandle;

describe("LocalAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listNotes", () => {
    it("should throw when no folder is selected", async () => {
      const adapter = new LocalAdapter();
      await expect(adapter.listNotes()).rejects.toThrow("No folder selected");
    });

    it("should return notes from the picked directory", async () => {
      const adapter = new LocalAdapter();
      const fileHandle = makeFileHandle("note.md", "# My Note\n\nContent.");
      const root = makeDirHandle([["note.md", fileHandle]]);
      Object.assign(adapter, { handle: root, isInitialized: true });

      const notes = await adapter.listNotes();
      expect(notes).toHaveLength(1);
    });

    it("should use the filename as the title", async () => {
      const adapter = new LocalAdapter();
      const fileHandle = makeFileHandle("my-note.md", "# Some Heading");
      const root = makeDirHandle([["my-note.md", fileHandle]]);
      Object.assign(adapter, { handle: root, isInitialized: true });

      const notes = await adapter.listNotes();
      expect(notes[0].title).toBe("my-note");
    });

    it("should skip hidden files", async () => {
      const adapter = new LocalAdapter();
      const hidden = makeFileHandle(".hidden.md", "# Hidden");
      const root = makeDirHandle([[".hidden.md", hidden]]);
      Object.assign(adapter, { handle: root, isInitialized: true });

      const notes = await adapter.listNotes();
      expect(notes).toHaveLength(0);
    });

    it("should skip non-markdown files", async () => {
      const adapter = new LocalAdapter();
      const img = makeFileHandle("image.png", "") as unknown as FileSystemFileHandle;
      (img as unknown as Record<string, unknown>).kind = "file";
      const root = makeDirHandle([["image.png", img as unknown as FileSystemHandle]]);
      Object.assign(adapter, { handle: root, isInitialized: true });

      const notes = await adapter.listNotes();
      expect(notes).toHaveLength(0);
    });
  });

  describe("readNote", () => {
    it("should return the file content as a string", async () => {
      const adapter = new LocalAdapter();
      const fileHandle = makeFileHandle("note.md", "# Hello\n\nWorld.");
      const root = makeDirHandle([]);
      (root.getFileHandle as ReturnType<typeof vi.fn>).mockResolvedValue(fileHandle);
      Object.assign(adapter, { handle: root, isInitialized: true });

      const content = await adapter.readNote("note.md");
      expect(content).toBe("# Hello\n\nWorld.");
    });

    it("should navigate into subdirectories for nested paths", async () => {
      const adapter = new LocalAdapter();
      const fileHandle = makeFileHandle("note.md", "# Nested");
      const subDir = makeDirHandle([]);
      (subDir.getFileHandle as ReturnType<typeof vi.fn>).mockResolvedValue(fileHandle);
      const root = makeDirHandle([]);
      (root.getDirectoryHandle as ReturnType<typeof vi.fn>).mockResolvedValue(subDir);
      Object.assign(adapter, { handle: root, isInitialized: true });

      const content = await adapter.readNote("folder/note.md");
      expect(root.getDirectoryHandle).toHaveBeenCalledWith("folder", { create: false });
      expect(content).toBe("# Nested");
    });
  });

  describe("saveNote", () => {
    it("should write content to the file", async () => {
      const adapter = new LocalAdapter();
      const writable = { write: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined) };
      const fileHandle = { createWritable: vi.fn().mockResolvedValue(writable) };
      const root = makeDirHandle([]);
      (root.getFileHandle as ReturnType<typeof vi.fn>).mockResolvedValue(fileHandle);
      Object.assign(adapter, { handle: root, isInitialized: true });

      await adapter.saveNote("note.md", "# New Content");
      expect(writable.write).toHaveBeenCalledWith("# New Content");
      expect(writable.close).toHaveBeenCalled();
    });

    it("should create directories for nested paths", async () => {
      const adapter = new LocalAdapter();
      const writable = { write: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined) };
      const fileHandle = { createWritable: vi.fn().mockResolvedValue(writable) };
      const subDir = makeDirHandle([]);
      (subDir.getFileHandle as ReturnType<typeof vi.fn>).mockResolvedValue(fileHandle);
      const root = makeDirHandle([]);
      (root.getDirectoryHandle as ReturnType<typeof vi.fn>).mockResolvedValue(subDir);
      Object.assign(adapter, { handle: root, isInitialized: true });

      await adapter.saveNote("folder/note.md", "content");
      expect(root.getDirectoryHandle).toHaveBeenCalledWith("folder", { create: true });
    });
  });

  describe("deleteNote", () => {
    it("should remove the file from the directory", async () => {
      const adapter = new LocalAdapter();
      const root = makeDirHandle([]);
      Object.assign(adapter, { handle: root, isInitialized: true });

      await adapter.deleteNote("note.md");
      expect(root.removeEntry).toHaveBeenCalledWith("note.md");
    });
  });
});
