import { describe, it, expect } from "vitest";
import { parseCalloutType } from "../utils/callout-plugin";

describe("callout-plugin", () => {
  describe("parseCalloutType", () => {
    it("should return 'note' for [!NOTE]", () => {
      expect(parseCalloutType("[!NOTE]")).toBe("note");
    });

    it("should return 'abstract' for [!ABSTRACT]", () => {
      expect(parseCalloutType("[!ABSTRACT]")).toBe("abstract");
    });

    it("should return 'abstract' for alias [!SUMMARY]", () => {
      expect(parseCalloutType("[!SUMMARY]")).toBe("abstract");
    });

    it("should return 'abstract' for alias [!TLDR]", () => {
      expect(parseCalloutType("[!TLDR]")).toBe("abstract");
    });

    it("should return 'info' for [!INFO]", () => {
      expect(parseCalloutType("[!INFO]")).toBe("info");
    });

    it("should return 'todo' for [!TODO]", () => {
      expect(parseCalloutType("[!TODO]")).toBe("todo");
    });

    it("should return 'tip' for [!TIP]", () => {
      expect(parseCalloutType("[!TIP]")).toBe("tip");
    });

    it("should return 'tip' for alias [!HINT]", () => {
      expect(parseCalloutType("[!HINT]")).toBe("tip");
    });

    it("should return 'tip' for alias [!IMPORTANT]", () => {
      expect(parseCalloutType("[!IMPORTANT]")).toBe("tip");
    });

    it("should return 'success' for [!SUCCESS]", () => {
      expect(parseCalloutType("[!SUCCESS]")).toBe("success");
    });

    it("should return 'success' for alias [!CHECK]", () => {
      expect(parseCalloutType("[!CHECK]")).toBe("success");
    });

    it("should return 'success' for alias [!DONE]", () => {
      expect(parseCalloutType("[!DONE]")).toBe("success");
    });

    it("should return 'question' for [!QUESTION]", () => {
      expect(parseCalloutType("[!QUESTION]")).toBe("question");
    });

    it("should return 'question' for alias [!FAQ]", () => {
      expect(parseCalloutType("[!FAQ]")).toBe("question");
    });

    it("should return 'warning' for [!WARNING]", () => {
      expect(parseCalloutType("[!WARNING]")).toBe("warning");
    });

    it("should return 'warning' for alias [!CAUTION]", () => {
      expect(parseCalloutType("[!CAUTION]")).toBe("warning");
    });

    it("should return 'failure' for [!FAILURE]", () => {
      expect(parseCalloutType("[!FAILURE]")).toBe("failure");
    });

    it("should return 'failure' for alias [!FAIL]", () => {
      expect(parseCalloutType("[!FAIL]")).toBe("failure");
    });

    it("should return 'danger' for [!DANGER]", () => {
      expect(parseCalloutType("[!DANGER]")).toBe("danger");
    });

    it("should return 'danger' for alias [!ERROR]", () => {
      expect(parseCalloutType("[!ERROR]")).toBe("danger");
    });

    it("should return 'bug' for [!BUG]", () => {
      expect(parseCalloutType("[!BUG]")).toBe("bug");
    });

    it("should return 'example' for [!EXAMPLE]", () => {
      expect(parseCalloutType("[!EXAMPLE]")).toBe("example");
    });

    it("should return 'quote' for [!QUOTE]", () => {
      expect(parseCalloutType("[!QUOTE]")).toBe("quote");
    });

    it("should return 'quote' for alias [!CITE]", () => {
      expect(parseCalloutType("[!CITE]")).toBe("quote");
    });

    it("should be case-insensitive for [!warning]", () => {
      expect(parseCalloutType("[!warning]")).toBe("warning");
    });

    it("should return 'note' when the line has no callout pattern", () => {
      expect(parseCalloutType("plain text")).toBe("note");
    });

    it("should return 'note' for an unknown callout type", () => {
      expect(parseCalloutType("[!UNKNOWN]")).toBe("note");
    });
  });
});
