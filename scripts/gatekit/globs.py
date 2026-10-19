"""Glob matching where brackets and parentheses are literal, so Next/Expo paths like [id].tsx and (auth)/ work."""
from __future__ import annotations

import re
from functools import lru_cache


@lru_cache(maxsize=512)
def glob_regex(pattern: str) -> re.Pattern:
    p = pattern.strip().replace("\\", "/")
    while p.startswith("./"):
        p = p[2:]
    if p.endswith("/"):
        p += "**"
    if "/" not in p:
        p = "**/" + p  # a bare pattern matches at any depth
    out, i = [], 0
    while i < len(p):
        if p.startswith("**/", i):
            out.append("(?:.*/)?")
            i += 3
        elif p.startswith("**", i):
            out.append(".*")
            i += 2
        elif p[i] == "*":
            out.append("[^/]*")
            i += 1
        elif p[i] == "?":
            out.append("[^/]")
            i += 1
        else:
            out.append(re.escape(p[i]))
            i += 1
    return re.compile("^" + "".join(out) + "$")


def matches(path: str, patterns: list[str]) -> bool:
    return any(glob_regex(p).match(path) for p in patterns)
