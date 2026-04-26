import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Note } from "../../adapters/storage-adapter";
import { buildTrie, type FileTrieNode } from "../../utils/file-trie";
import styles from "./FolderTree.module.scss";

const STORAGE_KEY = "quill-open-folders";

const loadOpenFolders = (allFolderPaths: string[]): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set<string>(JSON.parse(stored) as string[]);
  } catch {
    // ignore parse errors
  }
  // Default: open top-level folders (no "/" in path)
  return new Set(allFolderPaths.filter((p) => !p.includes("/")));
};

const saveOpenFolders = (openFolders: Set<string>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...openFolders]));
  } catch {
    // ignore storage errors
  }
};

type TreeNodeProps = {
  node: FileTrieNode;
  openFolders: Set<string>;
  selectedPath: string;
  onToggle: (path: string) => void;
};

const TreeNode = ({
  node,
  openFolders,
  selectedPath,
  onToggle,
}: TreeNodeProps): React.JSX.Element => {
  if (node.isFolder) {
    const isOpen = openFolders.has(node.path);
    return (
      <li className={styles.folderItem}>
        <div className={styles.folderContainer}>
          <button
            className={styles.folderToggle}
            onClick={() => onToggle(node.path)}
            aria-expanded={isOpen}
          >
            <svg
              className={`${styles.folderIcon} ${isOpen ? styles.open : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span>{node.displayName}</span>
          </button>
        </div>
        <div className={`${styles.folderOuter} ${isOpen ? styles.open : ""}`}>
          <ul className={styles.folderChildren}>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                openFolders={openFolders}
                selectedPath={selectedPath}
                onToggle={onToggle}
              />
            ))}
          </ul>
        </div>
      </li>
    );
  }

  const notePath = node.data?.path ?? node.path;
  const isActive = selectedPath === notePath;

  return (
    <li className={styles.fileItem}>
      <Link
        to={`/notes/${notePath}`}
        className={`${styles.fileLink} ${isActive ? styles.active : ""}`}
        title={node.displayName}
      >
        {node.displayName}
      </Link>
    </li>
  );
};

type FolderTreeProps = {
  notes: Note[];
};

export const FolderTree = ({ notes }: FolderTreeProps): React.JSX.Element => {
  const location = useLocation();
  const selectedPath = location.pathname.replace(/^\/notes\//, "");

  const root = buildTrie(notes);
  const allFolderPaths = root.getFolderPaths();

  const [openFolders, setOpenFolders] = useState<Set<string>>(() =>
    loadOpenFolders(allFolderPaths)
  );

  const handleToggle = (path: string): void => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      saveOpenFolders(next);
      return next;
    });
  };

  return (
    <nav className={styles.explorer} aria-label="File explorer">
      <ul className={styles.explorerList}>
        {root.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            openFolders={openFolders}
            selectedPath={selectedPath}
            onToggle={handleToggle}
          />
        ))}
      </ul>
    </nav>
  );
};
