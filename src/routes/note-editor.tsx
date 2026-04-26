import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Milkdown, MilkdownProvider, useEditor, useInstance } from "@milkdown/react";
import { getMarkdown, replaceAll } from "@milkdown/kit/utils";
import { useAdapter } from "../context/adapter-context";
import { useHeadings, type Heading } from "../context/headings-context";
import { useNotesRefresh } from "../context/notes-refresh-context";
import styles from "./note-editor.module.scss";
import { Crepe } from '@milkdown/crepe'
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame-dark.css";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const extractHeadings = (markdown: string): Heading[] =>
  markdown
    .split("\n")
    .filter((line) => /^#{1,3}\s/.test(line))
    .map((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (!match) return null;
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
      return { level, text, id };
    })
    .filter((h): h is Heading => h !== null);

type EditorInnerProps = {
  readonly initialContent: string;
  readonly onSave: (markdown: string) => Promise<void>;
  readonly onDelete: () => Promise<void>;
  readonly saveStatus: SaveStatus;
};

const CrepeEditor: React.FC<EditorInnerProps> = ({
  initialContent,
  onSave,
  onDelete,
  saveStatus,
}: EditorInnerProps): React.JSX.Element => {
  const [isEditorLoading, get] = useInstance();

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: initialContent,
    });
    return crepe;
  }, []);

  useEffect(() => {
    if (isEditorLoading) return;
    const editor = get();
    if (!editor) return;
    editor.action(replaceAll(initialContent));
  }, [isEditorLoading, initialContent, get]);

  const handleSave = useCallback(async (): Promise<void> => {
    if (isEditorLoading) return;
    const editor = get();
    if (!editor) return;
    const markdown = editor.action(getMarkdown());
    await onSave(markdown);
  }, [isEditorLoading, get, onSave]);

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorContent}>
        <Milkdown />
      </div>
      <div className={styles.floatingSave}>
        {saveStatus === "saved" && (
          <span className={styles.statusSaved} role="status">Saved</span>
        )}
        {saveStatus === "error" && (
          <span className={styles.statusError} role="alert">Failed to save</span>
        )}
        <button
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label="Delete note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isEditorLoading || saveStatus === "saving"}
          aria-label="Save note"
        >
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export const NoteEditor = (): React.JSX.Element => {
  const params = useParams();
  const notePath = params["*"] ?? "";
  const adapter = useAdapter();
  const { setHeadings } = useHeadings();
  const { refreshNotes } = useNotesRefresh();
  const navigate = useNavigate();

  const [content, setContent] = useState<string | null>(null);
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsFetchLoading(true);
    setFetchError(null);
    setHeadings([]);

    adapter
      .readNote(notePath)
      .then((markdown) => {
        if (!cancelled) {
          setContent(markdown);
          setHeadings(extractHeadings(markdown));
          setIsFetchLoading(false);
          setHasUnsavedChanges(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Note not found."
          );
          setIsFetchLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [adapter, notePath]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSave = useCallback(
    async (markdown: string): Promise<void> => {
      setSaveStatus("saving");
      try {
        await adapter.saveNote(notePath, markdown);
        setHasUnsavedChanges(false);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [adapter, notePath]
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!window.confirm(`Delete "${notePath}"? This cannot be undone.`)) return;
    try {
      await adapter.deleteNote(notePath);
      refreshNotes();
      navigate("/notes");
    } catch {
      // deletion failed — stay on the page, user can retry
    }
  }, [adapter, notePath, navigate, refreshNotes]);

  if (isFetchLoading) {
    return (
      <div className={styles.stateContainer}>
        <p className={styles.stateMessage}>Loading…</p>
      </div>
    );
  }

  if (fetchError !== null || content === null) {
    return (
      <div className={styles.stateContainer}>
        <p className={styles.notFoundMessage}>Note not found.</p>
      </div>
    );
  }

  return (
    <MilkdownProvider>
      {/* <EditorInner
        initialContent={content}
        onSave={handleSave}
        saveStatus={saveStatus}
      /> */}
      <CrepeEditor
        initialContent={content}
        onSave={handleSave}
        onDelete={handleDelete}
        saveStatus={saveStatus} />
    </MilkdownProvider>
  );
};
