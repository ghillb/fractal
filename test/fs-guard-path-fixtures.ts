export const FS_GUARD_PROTECTED_SELF_STATE_PATHS = [
  "JOURNAL.md",
  "src/evolve/journal.ts"
] as const;

export const FS_GUARD_PROTECTED_SEGMENT_CASES = [
  [".git", ".git/config"],
  [".env", ".env"],
  [".env", "state/.env.keys/active.json"],
  [".env", ".env.keys/active.json"]
] as const;
