import type { Note } from "../adapters/storage-adapter";

export class FileTrieNode {
  isFolder: boolean;
  children: FileTrieNode[];
  data: Note | null;
  private segments: string[];

  constructor(segments: string[], data?: Note) {
    this.children = [];
    this.segments = segments;
    this.data = data ?? null;
    this.isFolder = false;
  }

  get displayName(): string {
    if (this.data?.title) return this.data.title;
    const seg = this.segment;
    return seg.endsWith(".md") ? seg.slice(0, -3) : seg;
  }

  get segment(): string {
    return this.segments[this.segments.length - 1] ?? "";
  }

  get path(): string {
    return this.segments.join("/");
  }

  private makeChild(pathSegments: string[], data?: Note): FileTrieNode {
    const child = new FileTrieNode([...this.segments, pathSegments[0]], data);
    this.children.push(child);
    return child;
  }

  private insert(pathSegments: string[], data: Note): void {
    this.isFolder = true;
    const [head, ...tail] = pathSegments;

    if (tail.length === 0) {
      this.makeChild([head], data);
    } else {
      const child =
        this.children.find((c) => c.segment === head) ??
        this.makeChild([head], undefined);
      child.insert(tail, data);
    }
  }

  add(note: Note): void {
    this.insert(note.path.split("/"), note);
  }

  sort(sortFn: (a: FileTrieNode, b: FileTrieNode) => number): void {
    this.children = this.children.sort(sortFn);
    this.children.forEach((child) => child.sort(sortFn));
  }

  getFolderPaths(): string[] {
    const paths: string[] = [];
    if (this.isFolder && this.path) paths.push(this.path);
    this.children.forEach((child) => paths.push(...child.getFolderPaths()));
    return paths;
  }
}

const defaultSort = (a: FileTrieNode, b: FileTrieNode): number => {
  if (a.isFolder && !b.isFolder) return -1;
  if (!a.isFolder && b.isFolder) return 1;
  return a.displayName.localeCompare(b.displayName);
};

export const buildTrie = (notes: Note[]): FileTrieNode => {
  const root = new FileTrieNode([]);
  notes.forEach((note) => root.add(note));
  root.sort(defaultSort);
  return root;
};
