"""
Generate same-size social cards from finished screenshots.

For each screenshot in marketing/finished/, auto-detects the phone-frame bounds
(so exploded shots end up centered on the phone, not the bounding box) and
composites onto a brand-coloured canvas with the Vitrine logo top-left and the
domain top-right.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "marketing" / "finished"
OUT_DIR = ROOT / "marketing" / "social"
OUT_DIR.mkdir(parents=True, exist_ok=True)

ICON_PATH = ROOT / "icon.png"
FONT_PATH = "/System/Library/Fonts/HelveticaNeue.ttc"

CANVAS_W = 1080
CANVAS_H = 1350
BG_COLOR = (28, 38, 32, 255)       # --color-bg #1C2620
TEXT_COLOR = (240, 237, 232, 255)   # --color-text #F0EDE8

# Header geometry
EDGE_MARGIN = 64
LOGO_SIZE = 96
HEADER_Y = 56

# Vertical band reserved for the phone
PHONE_BAND_TOP = HEADER_Y + LOGO_SIZE + 64        # ~216
PHONE_BAND_BOTTOM = CANVAS_H - 80                 # ~1270
PHONE_BAND_H = PHONE_BAND_BOTTOM - PHONE_BAND_TOP # ~1054
PHONE_BAND_MAX_W = CANVAS_W - 160                 # leave horizontal breathing room


def detect_phone_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """Return (left, top, right, bottom) of the phone frame.

    The phone is the tallest contiguous vertical shape — its columns contain
    opaque pixels along most of the image height. Exploded UI bits only fill a
    small slice of height, so we filter columns by opaque-pixel density.
    """
    arr = np.array(img)
    if arr.shape[2] == 4:
        opaque = arr[:, :, 3] > 32
    else:
        opaque = np.ones(arr.shape[:2], dtype=bool)

    h, w = opaque.shape
    col_density = opaque.sum(axis=0) / h

    # Phone columns: those with density above a fraction of the max. The phone
    # body runs nearly the full height of the image (>=70% in practice). Use a
    # conservative threshold so rounded corners still count.
    threshold = max(0.55, col_density.max() * 0.75)
    phone_cols = np.where(col_density >= threshold)[0]
    if len(phone_cols) == 0:
        # Fallback: full bounding box.
        ys, xs = np.where(opaque)
        return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

    left = int(phone_cols.min())
    right = int(phone_cols.max()) + 1

    # Top/bottom: opaque rows within phone columns
    phone_strip = opaque[:, left:right]
    row_density = phone_strip.sum(axis=1) / max(1, right - left)
    rows = np.where(row_density >= 0.30)[0]
    if len(rows) == 0:
        top, bottom = 0, h
    else:
        top = int(rows.min())
        bottom = int(rows.max()) + 1
    return left, top, right, bottom


def render_card(src_path: Path, out_path: Path) -> None:
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), BG_COLOR)

    screenshot = Image.open(src_path).convert("RGBA")
    sw, sh = screenshot.size
    phone_l, phone_t, phone_r, phone_b = detect_phone_bbox(screenshot)
    phone_w = phone_r - phone_l
    phone_h = phone_b - phone_t

    # Scale so the phone fits the band on both axes.
    scale = min(PHONE_BAND_H / phone_h, PHONE_BAND_MAX_W / phone_w)
    new_w = int(round(sw * scale))
    new_h = int(round(sh * scale))
    screenshot_scaled = screenshot.resize((new_w, new_h), Image.LANCZOS)

    phone_cx_scaled = (phone_l + phone_w / 2) * scale
    phone_cy_scaled = (phone_t + phone_h / 2) * scale

    # Place so phone centre lands at canvas centre x, phone band centre y.
    target_cx = CANVAS_W / 2
    target_cy = (PHONE_BAND_TOP + PHONE_BAND_BOTTOM) / 2
    paste_x = int(round(target_cx - phone_cx_scaled))
    paste_y = int(round(target_cy - phone_cy_scaled))

    canvas.alpha_composite(screenshot_scaled, (paste_x, paste_y))

    # Logo top-left, with iOS-style rounded corners
    icon = Image.open(ICON_PATH).convert("RGBA")
    icon = icon.resize((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)
    mask = Image.new("L", (LOGO_SIZE, LOGO_SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, LOGO_SIZE, LOGO_SIZE),
        radius=int(LOGO_SIZE * 0.2237),
        fill=255,
    )
    icon.putalpha(mask)
    canvas.alpha_composite(icon, (EDGE_MARGIN, HEADER_Y))

    # Domain top-right, vertically centred on the logo
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(FONT_PATH, 38)
    text = "vitrineminis.com"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = CANVAS_W - EDGE_MARGIN - text_w
    text_y = HEADER_Y + (LOGO_SIZE - text_h) // 2 - bbox[1]
    draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)

    canvas.convert("RGB").save(out_path, "PNG", optimize=True)


def main() -> None:
    sources = sorted(SRC_DIR.glob("*.png"))
    for src in sources:
        out = OUT_DIR / src.name
        render_card(src, out)
        print(f"  {src.name} -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
