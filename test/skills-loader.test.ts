import { describe, expect, test } from "bun:test";
import { loadSkills } from "../src/skills/loader.ts";

describe("skills loader", () => {
  test("discovers required skills", async () => {
    const skills = await loadSkills(process.cwd());
    const names = Array.from(skills.keys()).sort();

    expect(names.includes("hackernews")).toBe(true);
    expect(names.includes("web-search")).toBe(true);
    expect(names.includes("sprites")).toBe(true);
    expect(names.includes("dialectic")).toBe(true);
  });
});
