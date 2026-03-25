import { describe, it, expect } from "vitest";
import { parseTags } from "./utils";

describe("parseTags", () => {
  it("parses a valid JSON array of strings", () => {
    expect(parseTags('["a","b"]')).toEqual(["a", "b"]);
  });

  it("returns empty array for empty string", () => {
    expect(parseTags("")).toEqual([]);
  });

  it("returns empty array for null", () => {
    expect(parseTags(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(parseTags(undefined)).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseTags("invalid")).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    expect(parseTags('{"not":"array"}')).toEqual([]);
  });
});
