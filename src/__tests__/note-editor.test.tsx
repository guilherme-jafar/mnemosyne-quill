import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { StorageAdapter } from "../adapters/storage-adapter";
import { AdapterProvider } from "../context/adapter-context";
import { HeadingsProvider } from "../context/headings-context";
import { NotesRefreshProvider } from "../context/notes-refresh-context";
import { NoteEditor } from "../routes/note-editor";

// Milkdown cannot run in jsdom — mock all three packages at the module boundary.
vi.mock("@milkdown/react", () => {
  const MilkdownProvider = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const Milkdown = () => React.createElement("div", { "data-testid": "milkdown-editor" });
  const useEditor = vi.fn();
  const useInstance = vi.fn(() => [false, vi.fn(() => undefined)] as [boolean, () => undefined]);
  return { MilkdownProvider, Milkdown, useEditor, useInstance };
});

vi.mock("@milkdown/crepe", () => ({
  Crepe: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@milkdown/kit/utils", () => ({
  getMarkdown: vi.fn(() => () => "# Hello"),
  replaceAll: vi.fn(() => () => undefined),
}));

const mockSaveNote = vi.fn();
const mockReadNote = vi.fn();

const mockAdapter: StorageAdapter = {
  listNotes: vi.fn().mockResolvedValue([]),
  readNote: mockReadNote,
  saveNote: mockSaveNote,
  deleteNote: vi.fn().mockResolvedValue(undefined),
};

function renderEditor(path = "notes/my-note.md"): ReturnType<typeof render> {
  return render(
    <AdapterProvider value={mockAdapter}>
      <NotesRefreshProvider>
        <HeadingsProvider>
          <MemoryRouter initialEntries={[`/notes/${path}`]}>
            <Routes>
              <Route path="/notes/*" element={<NoteEditor />} />
            </Routes>
          </MemoryRouter>
        </HeadingsProvider>
      </NotesRefreshProvider>
    </AdapterProvider>
  );
}

describe("NoteEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("should show loading state while fetching note", () => {
      mockReadNote.mockReturnValue(new Promise(() => undefined));
      renderEditor();
      expect(screen.getByText("Loading…")).toBeInTheDocument();
    });
  });

  describe("success state", () => {
    it("should render the Milkdown editor when note loads successfully", async () => {
      mockReadNote.mockResolvedValue("# Hello World");
      renderEditor();
      await screen.findByTestId("milkdown-editor");
    });

    it("should render the save button when note loads", async () => {
      mockReadNote.mockResolvedValue("# Hello World");
      renderEditor();
      const button = await screen.findByRole("button", { name: /save/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should show not found message when adapter throws", async () => {
      mockReadNote.mockRejectedValue(new Error("404"));
      renderEditor();
      await screen.findByText("Note not found.");
    });
  });

  describe("save behaviour", () => {
    it("should call saveNote when Save button is clicked", async () => {
      mockReadNote.mockResolvedValue("# Hello");
      mockSaveNote.mockResolvedValue(undefined);

      const { useInstance } = await import("@milkdown/react");
      const mockEditor = { action: vi.fn((fn) => fn()) };
      vi.mocked(useInstance).mockReturnValue([false, () => mockEditor as never]);

      renderEditor();
      const button = await screen.findByRole("button", { name: /save/i });
      await userEvent.click(button);

      expect(mockSaveNote).toHaveBeenCalledWith("notes/my-note.md", expect.any(String));
    });

    it("should show Saved message after successful save", async () => {
      mockReadNote.mockResolvedValue("# Hello");
      mockSaveNote.mockResolvedValue(undefined);

      const { useInstance } = await import("@milkdown/react");
      const mockEditor = { action: vi.fn((fn) => fn()) };
      vi.mocked(useInstance).mockReturnValue([false, () => mockEditor as never]);

      renderEditor();
      const button = await screen.findByRole("button", { name: /save/i });
      await userEvent.click(button);

      await screen.findByText("Saved");
    });

    it("should show error message when save fails", async () => {
      mockReadNote.mockResolvedValue("# Hello");
      mockSaveNote.mockRejectedValue(new Error("Network error"));

      const { useInstance } = await import("@milkdown/react");
      const mockEditor = { action: vi.fn((fn) => fn()) };
      vi.mocked(useInstance).mockReturnValue([false, () => mockEditor as never]);

      renderEditor();
      const button = await screen.findByRole("button", { name: /save/i });
      await userEvent.click(button);

      await screen.findByText("Failed to save");
    });
  });

  describe("beforeunload behaviour", () => {
    it("should register beforeunload listener when there are unsaved changes", async () => {
      mockReadNote.mockResolvedValue("# Hello");

      const addEventSpy = vi.spyOn(window, "addEventListener");

      renderEditor();

      await waitFor(() => {
        const beforeunloadCalls = addEventSpy.mock.calls.filter(
          ([event]) => event === "beforeunload"
        );
        expect(beforeunloadCalls.length).toBeGreaterThan(0);
      });

      addEventSpy.mockRestore();
    });

    it("should remove beforeunload listener after a successful save", async () => {
      mockReadNote.mockResolvedValue("# Hello");
      mockSaveNote.mockResolvedValue(undefined);

      const removeEventSpy = vi.spyOn(window, "removeEventListener");

      const { useInstance } = await import("@milkdown/react");
      const mockEditor = { action: vi.fn((fn) => fn()) };
      vi.mocked(useInstance).mockReturnValue([false, () => mockEditor as never]);

      renderEditor();
      const button = await screen.findByRole("button", { name: /save/i });

      await act(async () => {
        await userEvent.click(button);
      });

      await waitFor(() => {
        const removeBeforeunloadCalls = removeEventSpy.mock.calls.filter(
          ([event]) => event === "beforeunload"
        );
        expect(removeBeforeunloadCalls.length).toBeGreaterThan(0);
      });

      removeEventSpy.mockRestore();
    });
  });
});
