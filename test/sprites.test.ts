import { describe, expect, test } from "bun:test";
import { spriteEphemeralWorkflow } from "../src/tools/sprites.ts";

describe("sprites tool", () => {
  test("fails gracefully when disabled", async () => {
    await expect(
      spriteEphemeralWorkflow(
        { name: "qbuild", command: "echo ok" },
        {
          enabled: false,
          defaultName: "qbuild",
          timeoutSeconds: 5,
          retries: 0
        }
      )
    ).rejects.toThrow("SPRITES_ENABLED=true");
  });
});
