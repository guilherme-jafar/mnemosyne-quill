import { openDB } from "idb";
import type { Note, StorageAdapter } from "./storage-adapter";

const DB_NAME = "quill-local";
const DB_VERSION = 1;
const STORE_NAME = "handles";
const HANDLE_KEY = "quill-local-dir-handle";

async function getDb(): Promise<import("idb").IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

async function persistHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, handle, HANDLE_KEY);
}

async function restoreHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await getDb();
  return (await db.get(STORE_NAME, HANDLE_KEY)) ?? null;
}

async function* walkDir(
  dirHandle: FileSystemDirectoryHandle,
  prefix: string
): AsyncGenerator<Note> {
  for await (const [name, handle] of dirHandle) {
    if (name.startsWith(".")) continue;
    if (handle.kind === "directory") {
      const path = prefix ? `${prefix}/${name}` : name;
      yield* walkDir(handle as FileSystemDirectoryHandle, path);
    } else if (handle.kind === "file" && name.endsWith(".md")) {
      const path = prefix ? `${prefix}/${name}` : name;
      const title = name.replace(/\.md$/i, "");
      yield { path, title };
    }
  }
}

async function navigateToDir(
  root: FileSystemDirectoryHandle,
  segments: string[],
  create = false
): Promise<FileSystemDirectoryHandle> {
  let current = root;
  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create });
  }
  return current;
}

async function verifyPermission(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  const permission = await handle.queryPermission({ mode: "readwrite" });
  if (permission === "granted") return true;
  const requested = await handle.requestPermission({ mode: "readwrite" });
  return requested === "granted";
}

export class LocalAdapter implements StorageAdapter {
  private handle: FileSystemDirectoryHandle | null = null;
  private isInitialized = false;

  private async ensureHandle(): Promise<FileSystemDirectoryHandle> {
    if (!this.isInitialized) {
      this.handle = await restoreHandle();
      this.isInitialized = true;
    }
    if (!this.handle) {
      throw new Error(
        "No folder selected. Connect a local folder in Settings."
      );
    }
    const hasPermission = await verifyPermission(this.handle);
    if (!hasPermission) {
      throw new Error(
        "Permission denied. Please reconnect your folder in Settings."
      );
    }
    return this.handle;
  }

  async connect(): Promise<void> {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    await persistHandle(handle);
    this.handle = handle;
    this.isInitialized = true;
  }

  get isConnected(): boolean {
    return this.handle !== null;
  }

  async listNotes(): Promise<Note[]> {
    const root = await this.ensureHandle();
    const notes: Note[] = [];
    for await (const note of walkDir(root, "")) {
      notes.push(note);
    }
    return notes;
  }

  async readNote(path: string): Promise<string> {
    const root = await this.ensureHandle();
    const segments = path.split("/");
    const fileName = segments.pop()!;
    const dir =
      segments.length > 0 ? await navigateToDir(root, segments) : root;
    const fileHandle = await dir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return file.text();
  }

  async saveNote(path: string, content: string): Promise<void> {
    const root = await this.ensureHandle();
    const segments = path.split("/");
    const fileName = segments.pop()!;
    const dir =
      segments.length > 0
        ? await navigateToDir(root, segments, true)
        : root;
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async deleteNote(path: string): Promise<void> {
    const root = await this.ensureHandle();
    const segments = path.split("/");
    const fileName = segments.pop()!;
    const dir =
      segments.length > 0 ? await navigateToDir(root, segments) : root;
    await dir.removeEntry(fileName);
  }
}

export const localAdapter = new LocalAdapter();
