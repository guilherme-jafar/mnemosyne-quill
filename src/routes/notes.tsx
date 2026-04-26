import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useAdapter } from "../context/adapter-context";
import { HeadingsProvider } from "../context/headings-context";
import { NotesRefreshProvider, useNotesRefresh } from "../context/notes-refresh-context";
import type { Note } from "../adapters/storage-adapter";
import { FolderTree } from "../components/FolderTree/FolderTree";
import { Breadcrumb } from "../components/Breadcrumb/Breadcrumb";
import { RightPanel } from "../components/RightPanel/RightPanel";
import styles from "./notes.module.scss";

const LoadingSkeleton = (): React.JSX.Element => (
  <div className={styles.skeleton}>
    {[
      { width: "long" },
      { width: "indent medium" },
      { width: "indent short" },
      { width: "long" },
      { width: "indent medium" },
      { width: "medium" },
      { width: "indent short" },
    ].map((item, i) => (
      <div
        key={i}
        className={`${styles.skeletonLine} ${item.width
          .split(" ")
          .map((w) => styles[w])
          .join(" ")}`}
      />
    ))}
  </div>
);

const NotesInner = (): React.JSX.Element => {
  const adapter = useAdapter();
  const location = useLocation();
  const params = useParams();
  const { refreshKey } = useNotesRefresh();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const notePath = params["*"] ?? "";
  const hasNoteSelected = location.pathname !== "/notes";

  useEffect(() => {
    let cancelled = false;

    adapter.listNotes().then((result) => {
      if (!cancelled) {
        setNotes(result);
        setIsLoading(false);
      }
    }).catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Failed to load notes.");
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [adapter, refreshKey]);

  const renderSidebarContent = (): React.JSX.Element => {
    if (isLoading) return <LoadingSkeleton />;
    if (error)
      return (
        <div className={styles.stateContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      );
    if (notes.length === 0)
      return (
        <div className={styles.stateContainer}>
          <p className={styles.stateMessage}>
            No notes yet. Connect a storage adapter in Settings to load your
            notes.
          </p>
        </div>
      );
    return <FolderTree notes={notes} />;
  };

  return (
    <div className={styles.layout}>
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Notes</span>
          <button
            className={styles.hamburger}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.sidebarScroll}>{renderSidebarContent()}</div>
        <div className={styles.sidebarFooter}>
          <Link to="/settings" className={styles.settingsLink}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </Link>
        </div>
      </aside>

      <div className={styles.centerColumn}>
        {hasNoteSelected && <Breadcrumb notePath={notePath} />}
        <main className={styles.content}>
          <button
            className={`${styles.hamburger} ${styles.hamburgerOpen}`}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {hasNoteSelected ? (
            <Outlet />
          ) : (
            <div className={styles.placeholder}>
              Select a note to start reading.
            </div>
          )}
        </main>
      </div>

      {hasNoteSelected && <RightPanel />}
    </div>
  );
};

export const Notes = (): React.JSX.Element => (
  <NotesRefreshProvider>
    <HeadingsProvider>
      <NotesInner />
    </HeadingsProvider>
  </NotesRefreshProvider>
);
