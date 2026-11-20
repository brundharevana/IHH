"""The guide audio cache keys the caption too (build_guide_audio.py): a caption edit with the same words
said writes a new VTT on the existing audio, and --check (stale) reports any clip whose audio, caption
file or cue text is not what the current lines render. Codex Task 19: the Einstein honoured opening's
caption gained "[sic]" but the reused VTTs kept the old text."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_guide_audio as b  # noqa: E402  the module under test, next to this file


class NoSynth:
    def create(self, *a, **k):
        raise AssertionError("re-synthesised although the words said did not change")


def seed_clip(folder, voice, caption, spoken):
    """Files as an earlier render left them: the audio and a caption file with that caption."""
    p = b.plan(voice, caption, spoken)
    (folder / f"{p['cid']}.mp3").write_bytes(b"ID3")
    cues, t = [], 0.06
    for s in p["shown"]:
        cues.append((t, t + 1.5, s))
        t += 1.9
    b.write_vtt(folder / f"{p['vid']}.vtt", p["cid"], cues)
    return p


def test_caption_change_keeps_audio_and_rewrites_vtt(tmp_path):
    voice = "af_heart"
    spoken = "Gottenberg, Sweden. Take a moment and look around."
    old = seed_clip(tmp_path, voice, spoken, spoken)
    caption = "Gottenberg [sic], Sweden. Take a moment and look around."
    new = b.plan(voice, caption, spoken)
    assert new["cid"] == old["cid"] and new["vid"] != old["vid"]
    a, v, dur = b.render(NoSynth(), voice, caption, spoken, tmp_path)
    assert a == f"{old['cid']}.mp3" and v == f"{new['vid']}.vtt"
    cues = b.vtt_cues(tmp_path / v)
    assert [c[2] for c in cues] == ["Gottenberg [sic], Sweden.", "Take a moment and look around."]
    assert [c[:2] for c in cues] == [c[:2] for c in b.vtt_cues(tmp_path / f"{old['vid']}.vtt")]
    assert dur == round(cues[-1][1] + 0.06, 3)


def test_unchanged_line_reuses_both_files(tmp_path):
    p = seed_clip(tmp_path, "am_michael", "One line.", "One line.")
    assert b.render(NoSynth(), "am_michael", "One line.", "One line.", tmp_path)[:2] == (f"{p['cid']}.mp3", f"{p['vid']}.vtt")


def manifest(tmp_path, caption, spoken, vtt_caption=None):
    man, rows = {}, [("x:ch:arriving:opening", caption, spoken, ["X-F-1"])]
    for g, voice in b.GUIDE_VOICES.items():
        (tmp_path / g).mkdir()
        p = seed_clip(tmp_path / g, voice, vtt_caption or caption, spoken)
        man[g] = {"clips": {}, "narration": {rows[0][0]: {"src": f"/audio/guide/{g}/{p['cid']}.mp3",
                                                          "vtt": f"/audio/guide/{g}/{p['vid']}.vtt", "factIds": ["X-F-1"]}}}
    return man, rows


def test_check_passes_when_current(tmp_path):
    man, rows = manifest(tmp_path, "Here. Look around.", "Here. Look around.")
    assert b.stale(man, [], rows, tmp_path) == []


def test_check_fails_on_a_caption_the_vtt_does_not_carry(tmp_path):
    man, rows = manifest(tmp_path, "Gottenberg [sic], Sweden.", "Gottenberg, Sweden.", vtt_caption="Gottenberg, Sweden.")
    errs = b.stale(man, [], rows, tmp_path)
    assert any(e.startswith("stale caption a:") for e in errs)


def test_check_fails_on_changed_words_or_facts_or_missing_files(tmp_path):
    man, rows = manifest(tmp_path, "Here. Look around.", "Here. Look around.")
    changed = [(rows[0][0], "Here. Look up.", "Here. Look up.", ["X-F-1"])]
    assert any(e.startswith("stale audio b:") for e in b.stale(man, [], changed, tmp_path))
    refacts = [(*rows[0][:3], ["X-F-2"])]
    assert any(e.startswith("fact ids c:") for e in b.stale(man, [], refacts, tmp_path))
    for f in (tmp_path / "a").glob("*.vtt"):
        f.unlink()
    assert any(e.startswith("missing file a:") for e in b.stale(man, [], rows, tmp_path))
    assert any(e.startswith("missing a:") for e in b.stale({}, [], rows, tmp_path))


def test_shipped_einstein_honoured_caption_carries_sic():
    # the shipped manifest's VTTs for this opening carry the narration's caption, "[sic]" included
    import json
    man = json.loads(b.MANIFEST.read_text())["guides"]
    for g in b.GUIDE_VOICES:
        e = man[g]["narration"]["einstein:ch:honoured:opening"]
        text = " ".join(c[2] for c in b.vtt_cues(b.OUT / g / Path(e["vtt"]).name))
        assert "Gottenberg [sic]" in text
