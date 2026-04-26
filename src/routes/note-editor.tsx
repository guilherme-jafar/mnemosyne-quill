import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Milkdown, MilkdownProvider, useEditor, useInstance } from "@milkdown/react";
import { getMarkdown, replaceAll } from "@milkdown/kit/utils";
import { useAdapter } from "../context/adapter-context";
import styles from "./note-editor.module.scss";
import { Crepe } from '@milkdown/crepe'
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame-dark.css";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type EditorInnerProps = {
  readonly initialContent: string;
  readonly onSave: (markdown: string) => Promise<void>;
  readonly saveStatus: SaveStatus;
};

const CrepeEditor: React.FC<EditorInnerProps> = ({
  initialContent,
  onSave,
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
      <div className={styles.toolbar}>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isEditorLoading || saveStatus === "saving"}
          aria-label="Save note"
        >
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </button>
        {saveStatus === "saved" && (
          <span className={styles.statusSaved} role="status">
            Saved
          </span>
        )}
        {saveStatus === "error" && (
          <span className={styles.statusError} role="alert">
            Failed to save
          </span>
        )}
      </div>
      <div className={styles.editorContent}>
        <Milkdown />
      </div>
    </div>
  );
}

export const NoteEditor = (): React.JSX.Element => {
  const params = useParams();
  const notePath = params["*"] ?? "";
  const adapter = useAdapter();

  const [content, setContent] = useState<string | null>(null);
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsFetchLoading(true);
    setFetchError(null);

    adapter
      .readNote(notePath)
      .then((markdown) => {
        if (!cancelled) {
          setContent(markdown);
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
        saveStatus={saveStatus} />
    </MilkdownProvider>
  );
};
