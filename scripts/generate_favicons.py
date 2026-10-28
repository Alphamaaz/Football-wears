"""Generate the PriceAm favicon suite from the approved square brand image."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def build_transparent_mark(source_path: Path) -> Image.Image:
    source = Image.open(source_path).convert("RGB")
    pixels = np.asarray(source)
    maximum = pixels.max(axis=2)
    minimum = pixels.min(axis=2)
    colour_range = maximum - minimum

    mark_mask = (colour_range > 24) & (minimum < 245)
    rows, columns = np.where(mark_mask)
    if not rows.size or not columns.size:
        raise ValueError(f"No coloured PriceAm mark detected in {source_path}")

    left, right = int(columns.min()), int(columns.max()) + 1
    top, bottom = int(rows.min()), int(rows.max()) + 1
    cropped_pixels = pixels[top:bottom, left:right]
    cropped_minimum = minimum[top:bottom, left:right]

    # The supplied JPEG was exported against white. Recover a clean alpha edge
    # by removing that white matte instead of leaving a pale favicon halo.
    alpha = (255 - cropped_minimum).astype(np.int16)
    alpha = np.where(alpha < 18, 0, alpha)
    alpha = np.clip(alpha, 0, 255).astype(np.uint8)
    alpha_fraction = alpha.astype(np.float32) / 255
    matte = (1 - alpha_fraction)[..., None] * 255
    safe_alpha = np.where(alpha_fraction == 0, 1, alpha_fraction)[..., None]
    unmatte_rgb = np.clip((cropped_pixels.astype(np.float32) - matte) / safe_alpha, 0, 255)
    unmatte_rgb[alpha == 0] = 0
    rgba = np.dstack((unmatte_rgb.astype(np.uint8), alpha))
    mark = Image.fromarray(rgba, mode="RGBA")

    padding = round(max(mark.size) * 0.07)
    canvas_size = max(mark.size) + (2 * padding)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    position = ((canvas_size - mark.width) // 2, (canvas_size - mark.height) // 2)
    canvas.alpha_composite(mark, position)
    return canvas


def save_png(source: Image.Image, size: int, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    source.resize((size, size), Image.Resampling.LANCZOS).save(
        destination,
        format="PNG",
        optimize=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Approved PriceAm mark image")
    parser.add_argument(
        "--frontend-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
    )
    args = parser.parse_args()

    app_directory = args.frontend_root / "src" / "app"
    public_directory = args.frontend_root / "public"
    brand_icon = build_transparent_mark(args.source)

    png_outputs = {
        16: public_directory / "favicon-16x16.png",
        32: public_directory / "favicon-32x32.png",
        48: public_directory / "favicon-48x48.png",
        180: app_directory / "apple-icon.png",
        192: public_directory / "android-chrome-192x192.png",
        512: app_directory / "icon.png",
    }
    for size, destination in png_outputs.items():
        save_png(brand_icon, size, destination)

    save_png(brand_icon, 512, public_directory / "android-chrome-512x512.png")
    brand_icon.save(
        app_directory / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    print(f"Generated PriceAm favicon assets from {args.source}")


if __name__ == "__main__":
    main()
