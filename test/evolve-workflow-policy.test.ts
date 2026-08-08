import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("evolve workflow policy", () => {
  test("scheduled evolution uses fitness-gated mutation lanes instead of direct main pushes", () => {
    const directWorkflow = readFileSync(".github/workflows/evolve.yml", "utf8");
    const metaWorkflow = readFileSync(".github/workflows/evolve-meta.yml", "utf8");
    const taskWorkflow = readFileSync(".github/workflows/evolve-task.yml", "utf8");

    expect(directWorkflow).not.toContain("schedule:");
    expect(metaWorkflow).toContain("schedule:");
    expect(metaWorkflow).toContain("candidate_name: tools");
    expect(metaWorkflow).toContain("candidate_name: planning");
    expect(metaWorkflow).toContain("candidate_name: research");
    expect(metaWorkflow).toContain("candidate_name: simplify");
    expect(taskWorkflow).toContain("contents: read");
    expect(taskWorkflow).not.toContain("git push origin");
  });
});
