"""Build the photo-room textures from the Library of Congress photograph LAM-M-0023
(LC-USZ62-90162, "S.S. Normandie arriving in New York Harbor on maiden voyage", public domain).

Outputs (app/public/rooms-demo/):
  normandie-photo.webp   the photograph, mount border cropped (1486 x 1068)
  normandie-plate.webp   the "clean plate": the same photograph with the liner, three ferries,
                         Liberty Island and the catalogue sticker filled in, for the water and
                         backdrop layers (what shows behind a boat when the visitor moves)
  normandie-mask.webp    lossless mask, one channel per layer: R the liner, G the ferries,
                         B Liberty Island with the statue

The masts are left in the plate (too thin for a proxy). The polygons below were traced by hand on the 1536 x 1098 JPEG (pixel coordinates of that file).
The fill blends the open water on either side of each row of the hole, plus a little water grain borrowed from open water,
enough for the slivers a visitor sees when the camera moves a few metres. Not a restoration.

Run: python3 app/src/tour/demo/build-photo-room.py  (numpy + Pillow; cwebp on PATH)
"""
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[4]
SRC = ROOT / 'site/public/media/LAM-M-0023.jpg'
OUT = ROOT / 'app/public/rooms-demo'
CROP = (26, 4, 1512, 1072)  # the print's white mount removed

SHIP = [
    (476, 606), (492, 595), (540, 589), (566, 584), (704, 584),
    (736, 586), (738, 555), (786, 554), (789, 590), (880, 591), (881, 565), (933, 565), (936, 598),
    (1024, 600), (1025, 572), (1072, 571), (1076, 606), (1145, 624), (1200, 640), (1293, 661), (1284, 688), (1268, 702), (1000, 690),
    (860, 675), (700, 656), (560, 642), (500, 634), (486, 622),
]
FERRIES = [
    [(170, 668), (200, 662), (274, 665), (276, 654), (282, 654), (284, 667), (345, 671), (354, 690),
     (351, 724), (200, 717), (176, 713), (171, 690)],
    [(900, 742), (915, 736), (940, 734), (1018, 739), (1021, 726), (1056, 726), (1060, 745),
     (1092, 747), (1131, 754), (1139, 766), (1138, 791), (910, 787), (903, 766)],
    [(1153, 568), (1160, 553), (1180, 549), (1214, 548), (1215, 538), (1223, 538), (1224, 550),
     (1241, 551), (1242, 540), (1251, 540), (1253, 556), (1281, 560), (1301, 568), (1308, 580),
     (1300, 589), (1200, 586), (1160, 579)],
]
ISLAND = [
    (291, 377), (300, 368), (330, 360), (371, 356), (372, 330), (377, 320), (375, 291), (373, 282),
    (381, 280), (387, 290), (391, 302), (393, 320), (399, 331), (399, 349), (420, 349), (440, 352),
    (460, 349), (520, 351), (601, 354), (608, 366), (601, 373), (470, 381), (440, 391), (350, 399),
    (338, 392), (300, 384),
]
STICKER = [(1386, 1030), (1500, 1030), (1500, 1064), (1386, 1064)]


def poly_mask(size, polys, grow=0):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon(p, fill=255)
    if grow:
        m = m.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    return m


def row_fill(img, hole, win=12):
    """Fill each run of hole pixels in a row by blending the open water on its two sides (water and
    haze change mostly with distance, i.e. with the row), then soften the fill vertically."""
    out = img.copy()
    h, w = hole.shape
    for y in range(h):
        row = hole[y]
        if not row.any():
            continue
        x = 0
        while x < w:
            if not row[x]:
                x += 1
                continue
            x1 = x
            while x1 < w and row[x1]:
                x1 += 1
            left = img[y, max(0, x - win):x]
            right = img[y, x1:min(w, x1 + win)]
            a = left.mean(0) if len(left) else right.mean(0)
            b = right.mean(0) if len(right) else a
            t = np.linspace(0, 1, x1 - x)[:, None]
            out[y, x:x1] = a * (1 - t) + b * t
            x = x1
    blurred = np.asarray(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(float)
    return np.where(hole[..., None], blurred, img)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert('RGB')
    size = src.size
    # Each layer takes a few pixels of its own water with it, and the plate is filled under exactly
    # those pixels: from the photographer's spot the layers cover every filled pixel, so the room
    # at rest shows the photograph unchanged.
    GROW = 4
    ship = poly_mask(size, [SHIP], grow=GROW)
    ferries = poly_mask(size, FERRIES, grow=GROW)
    island = poly_mask(size, [ISLAND], grow=GROW)

    mask = Image.merge('RGB', (ship, ferries, island)).crop(CROP)
    mask.save(OUT / 'normandie-mask.png')

    # clean plate: fill the union of the layers (and the catalogue sticker, which no layer carries)
    hole_img = Image.fromarray(np.maximum.reduce([np.asarray(m) for m in (ship, ferries, island, poly_mask(size, [STICKER], grow=GROW))]))
    hole = np.asarray(hole_img) > 0
    arr = np.asarray(src).astype(float)
    filled = row_fill(arr, hole)
    # water grain: the high-pass of open water below-left of the liner, tiled
    patch = arr[860:1010, 40:440]
    hp = patch - np.asarray(Image.fromarray(patch.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(float)
    # mirrored tiling so the grain has no hard seams
    tile = np.concatenate([np.concatenate([hp, hp[:, ::-1]], 1), np.concatenate([hp[::-1], hp[::-1, ::-1]], 1)], 0)
    reps = (size[1] // tile.shape[0] + 1, size[0] // tile.shape[1] + 1, 1)
    grain = np.tile(tile, reps)[: size[1], : size[0]]
    # grain fades toward the horizon, where the water is smooth
    rows = np.linspace(0, 1, size[1])[:, None, None]
    k = np.clip((rows - 0.3) / 0.4, 0, 1) * 0.8
    plate = np.where(hole[..., None], filled + grain * k, arr)
    Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8)).crop(CROP).save(OUT / 'normandie-plate.png')
    src.crop(CROP).save(OUT / 'normandie-photo.png')

    for name, args in (('normandie-photo', ['-q', '86']), ('normandie-plate', ['-q', '82']), ('normandie-mask', ['-lossless'])):
        subprocess.run(['cwebp', '-quiet', *args, str(OUT / f'{name}.png'), '-o', str(OUT / f'{name}.webp')], check=True)
        (OUT / f'{name}.png').unlink()


if __name__ == '__main__':
    main()
