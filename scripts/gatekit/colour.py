"""Colour maths for tokens: parse oklch()/hex, WCAG contrast, and value checks for theme tokens."""
from __future__ import annotations

import math
import re

MIN_CONTRAST = 4.5  # WCAG AA for normal text
LIGHT_TEXT, DARK_TEXT = "oklch(0.985 0 0)", "oklch(0.145 0 0)"

NUM = r"[+-]?(?:\d+\.?\d*|\.\d+)"
OKLCH_RE = re.compile(rf"^oklch\(\s*({NUM})(%?)\s+({NUM})(%?)\s+({NUM}|none)(?:deg)?\s*(?:/\s*({NUM})(%?)\s*)?\)$", re.I)
HEX_RE = re.compile(r"^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$", re.I)
LENGTH_RE = re.compile(rf"^(?:0|{NUM}(?:rem|px|em))$")
DURATION_RE = re.compile(rf"^{NUM}m?s$")
EASE_RE = re.compile(rf"^(?:linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\(\s*{NUM}\s*(?:,\s*{NUM}\s*){{3}}\))$")
VAR_RE = re.compile(r"^var\(--[a-z0-9-]+(?:\s*,\s*[^;{}<>]+)?\)$", re.I)
UNSAFE = re.compile(r"[;{}<>\\`]|/\*|\*/|url\(|expression\(|@import", re.I)


def parse(value: str) -> tuple[tuple[float, float, float], float] | None:
    """A colour value as (linear sRGB, alpha), or None if it isn't a literal colour we can measure."""
    v = value.strip()
    m = OKLCH_RE.match(v)
    if m:
        lightness = float(m.group(1)) / (100 if m.group(2) else 1)
        chroma = float(m.group(3)) * (0.4 / 100 if m.group(4) else 1)
        hue = 0.0 if m.group(5).lower() == "none" else float(m.group(5))
        alpha = 1.0 if m.group(6) is None else float(m.group(6)) / (100 if m.group(7) else 1)
        return oklch_to_linear(lightness, chroma, hue), alpha
    m = HEX_RE.match(v)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        rgb = tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        alpha = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return tuple(_linearise(c) for c in rgb), alpha
    return None


def _linearise(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def oklch_to_linear(lightness: float, chroma: float, hue: float) -> tuple[float, float, float]:
    """OKLCH -> OKLab -> linear sRGB (Ottosson's matrices), clamped to the sRGB gamut."""
    a = chroma * math.cos(math.radians(hue))
    b = chroma * math.sin(math.radians(hue))
    l_ = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m_ = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s_ = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3
    rgb = (4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
           -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
           -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_)
    return tuple(min(1.0, max(0.0, c)) for c in rgb)


def luminance(linear_rgb: tuple[float, float, float]) -> float:
    r, g, b = linear_rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(bg: str, fg: str) -> float | None:
    """WCAG contrast ratio of two opaque colour values, or None if either can't be measured."""
    pb, pf = parse(bg), parse(fg)
    if not pb or not pf or pb[1] < 1 or pf[1] < 1:
        return None
    hi, lo = sorted((luminance(pb[0]), luminance(pf[0])), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def readable_text_for(bg: str) -> str:
    """Near-white or near-black, whichever reads better on bg."""
    light, dark = contrast(bg, LIGHT_TEXT) or 0, contrast(bg, DARK_TEXT) or 0
    return LIGHT_TEXT if light >= dark else DARK_TEXT


def kind_of(token: str) -> str:
    """What sort of value a token holds, from its name."""
    name = token.removeprefix("--")
    for prefix, kind in (("radius", "length"), ("spacing", "length"), ("icon-stroke", "number"),
                         ("shadow", "shadow"), ("inset-shadow", "shadow"), ("drop-shadow", "shadow"),
                         ("font", "font"), ("ease", "ease"), ("duration", "duration"),
                         ("text", "length"), ("tracking", "length"), ("leading", "number")):
        if name == prefix or name.startswith(prefix + "-"):
            return kind
    return "colour"


def check_value(token: str, value: str) -> str | None:
    """Why a value is unsafe or wrong for this token, or None if it's fine."""
    v = value.strip()
    if not v or len(v) > 200 or UNSAFE.search(v):
        return "unsafe characters (no ; { } < > \\ ` url() or comments)"
    if VAR_RE.match(v):
        return None
    kind = kind_of(token)
    if kind == "colour":
        if not parse(v):
            return "colours must be oklch(L C H) or #hex"
    elif kind == "length":
        if not LENGTH_RE.match(v):
            return "lengths must be a number with rem, px or em (e.g. 0.75rem)"
        if v.endswith("rem") and float(v[:-3]) > 4 and token.removeprefix("--").startswith("radius"):
            return "radius above 4rem looks broken - use a smaller value"
    elif kind == "number":
        try:
            if not 0 < float(v) <= 4:
                return "expected a number between 0 and 4"
        except ValueError:
            return "expected a number"
    elif kind == "duration" and not DURATION_RE.match(v):
        return "durations look like 150ms or 0.2s"
    elif kind == "ease" and not EASE_RE.match(v):
        return "easing must be a keyword or cubic-bezier(a, b, c, d)"
    return None


def partner(token: str, names: set[str]) -> tuple[str, str] | None:
    """The (background, foreground) pair a token belongs to, if both exist."""
    t = token.removeprefix("--")
    if t in ("background", "foreground"):
        pair = ("background", "foreground")
    elif t.endswith("-foreground"):
        pair = (t.removesuffix("-foreground"), t)
    else:
        pair = (t, t + "-foreground")
    return pair if pair[0] in names and pair[1] in names else None


def check_pairs(tokens: dict[str, str]) -> list[str]:
    """Every background/foreground pair below the minimum contrast."""
    problems, seen = [], set()
    for name in sorted(tokens):
        pair = partner(name, set(tokens))
        if not pair or pair in seen:
            continue
        seen.add(pair)
        ratio = contrast(tokens[pair[0]], tokens[pair[1]])
        if ratio is not None and ratio < MIN_CONTRAST:
            problems.append(f"{pair[0]} / {pair[1]}: contrast {ratio:.2f}:1, needs {MIN_CONTRAST}:1")
    return problems
