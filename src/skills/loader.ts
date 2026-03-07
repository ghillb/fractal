import { existsSync } from "node:fs";
import { glob } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { dirname, basename } from "node:path";

export type Skill = {
  name: string;
  description: string;
  path: string;
  body: string;
  scriptsPath?: string;
};

function parseFrontmatter(markdown: string): { meta: Record<string, string>; body: string } {
  if (!markdown.startsWith("---\n")) {
    return { meta: {}, body: markdown };
  }

  const closing = markdown.indexOf("\n---\n", 4);
  if (closing === -1) {
    return { meta: {}, body: markdown };
  }

  const rawMeta = markdown.slice(4, closing);
  const body = markdown.slice(closing + 5);
  const meta: Record<string, string> = {};

  for (const line of rawMeta.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    meta[key] = value;
  }

  return { meta, body };
}

export async function loadSkills(root = process.cwd()): Promise<Map<string, Skill>> {
  const skillMap = new Map<string, Skill>();

  for await (const skillFile of glob(`${root}/.agents/skills/**/SKILL.md`)) {
    const path = skillFile.toString();
    const markdown = await readFile(path, "utf8");
    const parsed = parseFrontmatter(markdown);
    const fallbackName = basename(dirname(path));
    const name = parsed.meta.name || fallbackName;
    const scriptsPath = `${dirname(path)}/scripts`;

    skillMap.set(name, {
      name,
      description: parsed.meta.description ?? "",
      path,
      body: parsed.body.trim(),
      scriptsPath: existsSync(scriptsPath) ? scriptsPath : undefined
    });
  }

  return skillMap;
}
