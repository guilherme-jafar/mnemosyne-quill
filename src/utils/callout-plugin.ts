import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/prose/view";

const CALLOUT_TYPES = [
  "note", "abstract", "info", "todo", "tip", "success",
  "question", "warning", "failure", "danger", "bug", "example", "quote",
] as const;

type CalloutType = (typeof CALLOUT_TYPES)[number];

const CALLOUT_ALIASES: Record<string, CalloutType> = {
  summary: "abstract",
  tldr: "abstract",
  hint: "tip",
  important: "tip",
  check: "success",
  done: "success",
  help: "question",
  faq: "question",
  attention: "warning",
  caution: "warning",
  missing: "failure",
  fail: "failure",
  error: "danger",
  cite: "quote",
};

const CALLOUT_PATTERN = /^\[!([a-zA-Z-]+)\]/;

export function parseCalloutType(firstLine: string): CalloutType {
  const match = CALLOUT_PATTERN.exec(firstLine.trim());
  if (!match) return "note";
  const raw = match[1].toLowerCase();
  if ((CALLOUT_TYPES as readonly string[]).includes(raw)) return raw as CalloutType;
  return CALLOUT_ALIASES[raw] ?? "note";
}

const calloutPluginKey = new PluginKey("callout");

export const calloutPlugin = $prose(() => {
  return new Plugin({
    key: calloutPluginKey,
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];

        state.doc.descendants((node, pos) => {
          if (node.type.name !== "blockquote") return;

          const firstChild = node.firstChild;
          if (!firstChild) return;

          const text = firstChild.textContent.replace(/\n/g, "<br/>");
          const trimmed = text.trimStart();
          const leadingSpaces = text.length - trimmed.length;
          const match = CALLOUT_PATTERN.exec(trimmed);
          if (!match) return;

          const calloutType = parseCalloutType(trimmed);

          // Decorate the blockquote with data-callout attribute
          decorations.push(
            Decoration.node(pos, pos + node.nodeSize, {
              "data-callout": calloutType,
            })
          );

          // Hide [!TYPE] marker (+ trailing space if present) via inline decoration.
          // pos+1 enters the blockquote, pos+2 enters the first paragraph.
          debugger
          const textStart = pos + 2 + leadingSpaces;
          const markerEnd = textStart + match[0].length;
          const hasTrailingSpace = trimmed.charAt(match[0].length) === " ";
          const hideEnd = hasTrailingSpace ? markerEnd + 1 : markerEnd;

          decorations.push(
            Decoration.inline(textStart, hideEnd, { style: "display:none" })
          );
        });

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
});
