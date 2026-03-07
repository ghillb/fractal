#!/usr/bin/env python3
import os
import sys
from pathlib import Path

TEMPLATE = {
    "context_briefing.md": "# Context Briefing\n\n",
    "monk_a_output.md": "# Monk A Output\n\n",
    "monk_b_output.md": "# Monk B Output\n\n",
    "determinate_negation.md": "# Determinate Negation\n\n",
    "sublation.md": "# Sublation\n\n",
    "dialectic_queue.md": "# Dialectic Queue\n\n",
    "index.md": "# Dialectic Index\n\n"
}


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: init_dialectic.py <topic>")

    topic = sys.argv[1].strip().replace("/", "-")
    if not topic:
        raise SystemExit("Topic cannot be empty")

    base = Path.home() / ".cada" / "dialectics" / topic
    base.mkdir(parents=True, exist_ok=True)

    for file_name, content in TEMPLATE.items():
        path = base / file_name
        if not path.exists():
            path.write_text(content, encoding="utf-8")

    print(str(base))


if __name__ == "__main__":
    main()
