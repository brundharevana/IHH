"""Room textures (tools/build_room_textures.py): every colour map shipped in site/public/tex is
CC0-credited and light enough that a lit surface never reads as a black hole (the same floor as
site/src/test/exhibit-finish.test.js MIN_LUMINANCE)."""

from PIL import Image

from build_room_textures import OUT, SETS, luminance

MIN_LUMINANCE = 0.05


def test_every_colour_map_is_light_enough():
    maps = sorted(OUT.glob("*/color-*.webp"))
    assert maps, "no colour maps built"
    for p in maps:
        assert luminance(Image.open(p)) >= MIN_LUMINANCE, p


def test_every_built_set_is_credited_as_cc0_poly_haven():
    credits = (OUT / "CREDITS.md").read_text()
    for name, (asset, maps) in SETS.items():
        assert f"| {name}/ |" in credits and f"https://polyhaven.com/a/{asset}" in credits
        for out_map, (_, sizes, _) in maps.items():
            for px in sizes:
                assert (OUT / name / f"{out_map}-{px}.webp").exists(), (name, out_map, px)
    assert "CC0" in credits


def test_no_unlisted_texture_ships():
    listed = {f"{n}/{m}-{px}.webp" for n, (_, maps) in SETS.items() for m, (_, sizes, _) in maps.items() for px in sizes}
    shipped = {str(p.relative_to(OUT)) for p in OUT.rglob("*") if p.is_file() and p.name != "CREDITS.md"}
    assert shipped == listed
