import pytest

from build_audio import ts, vtt_from_segments


def test_timestamp_format():
    assert ts(0) == "00:00:00.000"
    assert ts(61.5) == "00:01:01.500"


def test_vtt_has_ids_and_order():
    v = vtt_from_segments([("c1", 0.0, 2.5, "First."), ("c2", 2.5, 5.0, "Second.")])
    assert v.startswith("WEBVTT\n\n")
    assert "c1\n00:00:00.000 --> 00:00:02.500\nFirst.\n" in v
    assert v.index("c1") < v.index("c2")


def test_rejects_overlap():
    with pytest.raises(ValueError):
        vtt_from_segments([("c1", 0.0, 3.0, "A"), ("c2", 2.0, 4.0, "B")])


def test_validate_voices_names_quote_and_known_voices():
    from build_audio import validate_voices

    ch = {"quotes": [{"id": "q1", "text": "A.", "voice": "einstein-ai"},
                     {"id": "q2", "text": "B.", "voice": "einstien-ai"}]}
    with pytest.raises(ValueError) as e:
        validate_voices(ch)
    msg = str(e.value)
    assert "q2" in msg and "einstien-ai" in msg
    assert "einstein-ai" in msg and "guide" in msg and "recording" in msg


def test_validate_voices_accepts_known_and_recording():
    from build_audio import validate_voices

    validate_voices({"quotes": [{"id": "q1", "text": "A.", "voice": "einstein-ai"},
                                {"id": "q2", "text": "B.", "voice": "recording"}]})
    validate_voices({"narration": []})


def test_missing_voice_is_rejected():
    from build_audio import validate_voices

    with pytest.raises(ValueError, match="q9"):
        validate_voices({"quotes": [{"id": "q9", "text": "A."}]})


def test_main_validates_before_loading_the_model(tmp_path, monkeypatch):
    """A bad voice fails before any audio is synthesised (no model needed, nothing written)."""
    import json
    import build_audio

    (tmp_path / "content" / "x" / "chapters").mkdir(parents=True)
    (tmp_path / "content" / "x" / "chapters" / "1.json").write_text(json.dumps(
        {"narration": [{"cue": "c1", "text": "A."}], "quotes": [{"id": "q1", "text": "B.", "voice": "nobody"}]}))
    monkeypatch.setattr(build_audio, "ROOT", tmp_path)
    with pytest.raises(ValueError, match="q1"):
        build_audio.main("x", "1")
    assert not (tmp_path / "content" / "x" / "audio").exists()
