import { describe, it, expect } from "vitest";
import { buildTrie } from "../utils/file-trie";

describe("file-trie", () => {
  describe("buildTrie", () => {
    it("should return empty root when notes array is empty", () => {
      const root = buildTrie([]);
      expect(root.children).toHaveLength(0);
    });

    it("should place a root-level file as a direct child of root", () => {
      const root = buildTrie([{ path: "README.md", title: "README" }]);
      expect(root.children).toHaveLength(1);
      expect(root.children[0].path).toBe("README.md");
    });

    it("should create a folder node for nested files", () => {
      const root = buildTrie([
        { path: "Meetings/january.md", title: "January" },
      ]);
      const folder = root.children[0];
      expect(folder.isFolder).toBe(true);
      expect(folder.segment).toBe("Meetings");
    });

    it("should nest a file inside its parent folder", () => {
      const root = buildTrie([
        { path: "Meetings/january.md", title: "January" },
      ]);
      const file = root.children[0].children[0];
      expect(file.isFolder).toBe(false);
      expect(file.path).toBe("Meetings/january.md");
    });

    it("should group multiple files under the same folder", () => {
      const root = buildTrie([
        { path: "Books/book-a.md", title: "Book A" },
        { path: "Books/book-b.md", title: "Book B" },
      ]);
      expect(root.children).toHaveLength(1);
      expect(root.children[0].children).toHaveLength(2);
    });

    it("should sort folders before files at the same level", () => {
      const root = buildTrie([
        { path: "README.md", title: "README" },
        { path: "Notes/idea.md", title: "Idea" },
      ]);
      expect(root.children[0].isFolder).toBe(true);
      expect(root.children[1].isFolder).toBe(false);
    });

    it("should sort siblings alphabetically", () => {
      const root = buildTrie([
        { path: "Zebra/note.md", title: "Note" },
        { path: "Alpha/note.md", title: "Note" },
      ]);
      expect(root.children[0].segment).toBe("Alpha");
      expect(root.children[1].segment).toBe("Zebra");
    });

    it("should use the note title as displayName for file nodes", () => {
      const root = buildTrie([{ path: "note.md", title: "My Custom Title" }]);
      expect(root.children[0].displayName).toBe("My Custom Title");
    });

    it("should strip .md extension from displayName when no title is set", () => {
      const folder = buildTrie([{ path: "Folder/sub.md", title: "sub" }])
        .children[0];
      expect(folder.isFolder).toBe(true);
      expect(folder.displayName).toBe("Folder");
    });

    it("should return folder paths via getFolderPaths", () => {
      const root = buildTrie([
        { path: "Projects/alpha.md", title: "Alpha" },
        { path: "Books/book.md", title: "Book" },
      ]);
      const paths = root.getFolderPaths();
      expect(paths).toContain("Projects");
      expect(paths).toContain("Books");
    });

    it("should handle deeply nested paths", () => {
      const root = buildTrie([
        { path: "a/b/c/note.md", title: "Note" },
      ]);
      const a = root.children[0];
      const b = a.children[0];
      const c = b.children[0];
      const note = c.children[0];
      expect(a.segment).toBe("a");
      expect(b.segment).toBe("b");
      expect(c.segment).toBe("c");
      expect(note.path).toBe("a/b/c/note.md");
    });
  });
});
