#!/usr/bin/env python3
"""Generate responsive photo variants for public/assets/visuals/.

Masters (never overwritten):
  <stem>.webp                1536 px wide landscape photographs
  13-mobile-hero-1024.webp   1024 x 1536 portrait phone hero

Outputs, for every master:
  <stem>-<width>.avif   AVIF at each width (served first through <picture>)
  <stem>-<width>.webp   WebP at each width below the master width (fallback)
plus, if missing, a 480 px low-quality backdrop in public/assets/backdrops/.

Run after adding or replacing a photograph:  python3 scripts/images.py
Requires Pillow 11+ with AVIF support (pip install pillow).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
VISUALS = ROOT / "public" / "assets" / "visuals"
BACKDROPS = ROOT / "public" / "assets" / "backdrops"
LANDSCAPE = [480, 768, 1080, 1536]
PORTRAIT = [480, 768, 1024]
WEBP_Q, AVIF_Q = 74, 52


def variants(master: Path, stem: str, widths: list[int]) -> None:
    src = Image.open(master).convert("RGB")
    for width in widths:
        img = src if width >= src.width else src.resize((width, round(src.height * width / src.width)), Image.LANCZOS)
        img.save(VISUALS / f"{stem}-{width}.avif", quality=AVIF_Q, speed=4)
        if width < src.width:
            img.save(VISUALS / f"{stem}-{width}.webp", quality=WEBP_Q, method=6)


def backdrop(master: Path, stem: str) -> None:
    if (BACKDROPS / f"{stem}.webp").exists():
        return
    src = Image.open(master).convert("RGB")
    small = src.resize((480, round(src.height * 480 / src.width)), Image.LANCZOS)
    small.save(BACKDROPS / f"{stem}.webp", quality=30, method=6)


def main() -> None:
    for master in sorted(VISUALS.glob("[0-9][0-9]-*.webp")):
        stem = master.stem
        if stem.rsplit("-", 1)[-1].isdigit():
            continue  # a generated variant, or the portrait master handled below
        variants(master, stem, LANDSCAPE)
        backdrop(master, stem)
        print("landscape", stem)
    hero = VISUALS / "13-mobile-hero-1024.webp"
    if hero.exists():
        variants(hero, "13-mobile-hero", PORTRAIT)
        backdrop(hero, "13-mobile-hero")
        print("portrait 13-mobile-hero")


if __name__ == "__main__":
    main()
