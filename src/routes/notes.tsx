import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAdapter } from "../context/adapter-context";
import type { Note } from "../adapters/storage-adapter";
import { FolderTree } from "../components/FolderTree/FolderTree";
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

export const Notes = (): React.JSX.Element => {
  const adapter = useAdapter();
  const location = useLocation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  }, [adapter]);

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
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Notes</span>
          <button
            className={styles.hamburger}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.sidebarScroll}>{renderSidebarContent()}</div>
      </aside>

      <main className={styles.content}>
        <button
          className={styles.hamburger}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{ margin: "1rem" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
  );
};
