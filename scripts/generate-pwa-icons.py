#!/usr/bin/env python3
"""
One-off script: generates simple placeholder PWA icons (dark background,
"Cilo" wordmark) at the sizes required by manifest.ts and apple-touch-icon.
Replace public/icons/*.png with real designed icons whenever you have them --
this script exists just to document how the placeholders were made.

Usage: python3 scripts/generate-pwa-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "icons"

BACKGROUND = (10, 10, 10)  # matches --background dark (#0a0a0a)
FOREGROUND = (237, 237, 237)  # matches --foreground dark (#ededed)
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def draw_icon(size: int, safe_zone_ratio: float = 1.0) -> Image.Image:
    """safe_zone_ratio < 1.0 shrinks the wordmark so it survives adaptive
    icon masking (maskable icons should keep content in the center ~80%)."""
    img = Image.new("RGB", (size, size), BACKGROUND)
    draw = ImageDraw.Draw(img)

    text = "Cilo"
    font_size = int(size * 0.42 * safe_zone_ratio)
    font = ImageFont.truetype(FONT_PATH, font_size)

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) / 2 - bbox[0]
    y = (size - text_h) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=FOREGROUND)

    return img


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    targets = [
        ("icon-192.png", 192, 1.0),
        ("icon-512.png", 512, 1.0),
        ("icon-maskable-192.png", 192, 0.7),
        ("icon-maskable-512.png", 512, 0.7),
        ("apple-touch-icon.png", 180, 1.0),
    ]

    for filename, size, safe_zone_ratio in targets:
        img = draw_icon(size, safe_zone_ratio)
        out_path = OUT_DIR / filename
        img.save(out_path, "PNG")
        print(f"Wrote {out_path} ({size}x{size})")


if __name__ == "__main__":
    main()
