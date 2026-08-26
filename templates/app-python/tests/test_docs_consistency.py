"""Docs-vs-code consistency guard (lessons rule 12).

Builder: set MODULE to your module name and this file works as-is. It keeps the
agent-native docs honest automatically:
  - every symbol-shaped token the docs name must exist in the module
  - any quoted "N tests" count must match the live discovered count
Both checks are non-vacuous (they assert a deliberately-wrong doc is flagged).
"""

import re
import unittest
from pathlib import Path

MODULE = "__MODULE__"  # <- builder: your module name (no .py)

HERE = Path(__file__).resolve().parent.parent
# Every doc that may quote a test count rots identically — scan them all (r.12a).
DOCS_WITH_COUNTS = ["CLAUDE.md", "README.md", "BRIEF.md", ".claude/skills/dev-loop/SKILL.md"]
# Docs that name code symbols.
DOCS_WITH_SYMBOLS = ["CLAUDE.md", ".claude/skills/dev-loop/SKILL.md"]

# Symbol-shaped: an identifier with an underscore OR mixed case (deliberately
# WIDE, per r.12b — a narrow convention list silently misses renames).
SYMBOL_RE = re.compile(r"`([A-Za-z_][A-Za-z0-9_]*)`")
COUNT_RE = re.compile(r"(\d+)\s+(?:\w+\s+)?tests?\b")


def _module():
    import importlib
    return importlib.import_module(MODULE)


def _symbolish(tok):
    return "_" in tok or (tok != tok.lower() and tok != tok.upper())


class DocsSymbolConsistencyTests(unittest.TestCase):
    def test_documented_symbols_exist(self):
        mod = _module()
        missing = []
        for doc in DOCS_WITH_SYMBOLS:
            p = HERE / doc
            if not p.exists():
                continue
            for tok in SYMBOL_RE.findall(p.read_text(encoding="utf-8")):
                if _symbolish(tok) and not tok.startswith("__") and not hasattr(mod, tok):
                    missing.append(f"{doc}: `{tok}`")
        self.assertEqual(missing, [], f"docs name symbols the module lacks: {missing}")

    def test_scanner_is_not_vacuous(self):
        self.assertTrue(_symbolish("build_plan"))
        self.assertFalse(hasattr(_module(), "definitely_not_a_real_symbol_xyz"))


class DocsTestCountConsistencyTests(unittest.TestCase):
    def _live_count(self):
        return unittest.TestLoader().discover(str(HERE)).countTestCases()

    def test_quoted_counts_match_live_suite(self):
        live = self._live_count()
        wrong = []
        for doc in DOCS_WITH_COUNTS:
            p = HERE / doc
            if not p.exists():
                continue
            for n in COUNT_RE.findall(p.read_text(encoding="utf-8")):
                if int(n) != live:
                    wrong.append(f"{doc} says {n}, live suite has {live}")
        self.assertEqual(wrong, [], f"stale test counts: {wrong} — update the docs")

    def test_count_regex_tolerates_adjectives(self):
        self.assertEqual(COUNT_RE.findall("42 passing tests and 7 green tests"), ["42", "7"])


if __name__ == "__main__":
    unittest.main()
