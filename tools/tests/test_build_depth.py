import numpy as np
import pytest

from build_depth import MODEL_SHA256, model_input_size, normalise, output_size


def test_input_size_is_multiple_of_14_and_keeps_aspect():
    w, h = model_input_size(648, 800)
    assert w == 518 and h % 14 == 0
    assert abs(h / w - 800 / 648) < 0.03


def test_input_size_landscape_uses_short_side():
    w, h = model_input_size(1000, 500)
    assert h == 518 and w % 14 == 0


def test_output_size_long_side_512():
    assert output_size(648, 800) == (415, 512)
    assert output_size(1000, 500) == (512, 256)


def test_normalise_to_unit_range():
    d = normalise(np.array([[2.0, 4.0], [6.0, 10.0]]))
    assert d.min() == 0.0 and d.max() == 1.0


def test_normalise_rejects_flat_map():
    with pytest.raises(ValueError):
        normalise(np.ones((3, 3)))


def test_model_hash_pinned():
    assert len(MODEL_SHA256) == 64
