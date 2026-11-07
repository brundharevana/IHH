import pytest

import fetch_media as fm


def test_fit_keeps_aspect_and_caps_the_long_side():
    assert fm.fit((5088, 6576), 2048) == (1585, 2048)
    assert fm.fit((4875, 2658), 1024) == (1024, 558)
    assert fm.fit((800, 600), 2048) == (800, 600)  # never upscaled


def test_download_host_must_be_the_holders():
    rec = {"id": "M1", "url": "https://catalog.archives.gov/id/596270"}
    fm.check_host(rec, "https://catalog.archives.gov/medialz/x.jpg")
    loc = {"id": "M2", "url": "https://www.loc.gov/item/2004671908/"}
    fm.check_host(loc, "https://tile.loc.gov/storage-services/a.jpg")
    with pytest.raises(ValueError, match="M1"):
        fm.check_host(rec, "https://upload.wikimedia.org/x.jpg")
    with pytest.raises(ValueError, match="M2"):
        fm.check_host(loc, "http://tile.loc.gov/a.jpg")
    with pytest.raises(ValueError):
        fm.check_host({"id": "M3", "url": "https://albert.ias.edu/x"}, "https://albert.ias.edu/x.jpg")


def test_ucla_library_files_come_from_its_own_iiif_server_only():
    ucla = {"id": "M4", "url": "https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690"}
    fm.check_host(ucla, "https://iiif.library.ucla.edu/iiif/2/ark%3A%2F21198%2Fzz002dd690/full/2048,/0/default.jpg")
    for bad in ("https://upload.wikimedia.org/x.jpg", "http://iiif.library.ucla.edu/x.jpg", "https://iiif.library.ucla.edu.evil.example/x.jpg"):
        with pytest.raises(ValueError, match="M4"):
            fm.check_host(ucla, bad)


def test_only_verified_usable_media():
    fm.check_usable({"id": "M1", "status": "verified", "license_class": "public-domain"})
    for bad in ({"status": "verified", "license_class": "unknown"}, {"status": "disputed", "license_class": "cc0"}):
        with pytest.raises(ValueError, match="M9"):
            fm.check_usable(dict(bad, id="M9"))


def test_key_must_name_the_media_and_page():
    fm.check_key({"key": "EIN-M-0019-p3", "media_id": "EIN-M-0019", "page": 3})
    fm.check_key({"key": "EIN-M-0006", "media_id": "EIN-M-0006"})
    for bad in ({"key": "EIN-M-0019-p2", "media_id": "EIN-M-0019", "page": 3},
                {"key": "EIN-M-0019", "media_id": "EIN-M-0019", "page": 3},
                {"key": "../x", "media_id": "EIN-M-0019"}):
        with pytest.raises(ValueError):
            fm.check_key(bad)


class _Resp:
    def __init__(self, final, data=b"jpeg"):
        self.final, self.data = final, data

    def geturl(self):
        return self.final

    def read(self):
        return self.data

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


REC = {"id": "M1", "url": "https://catalog.archives.gov/id/596270"}
URL = "https://catalog.archives.gov/medialz/x/596270_001.jpg"


def test_redirect_off_the_holder_host_is_refused(monkeypatch, tmp_path):
    monkeypatch.setattr(fm.urllib.request, "urlopen", lambda req, timeout: _Resp("https://evil.example/x.jpg"))
    with pytest.raises(ValueError, match="M1"):
        fm.fetch(REC, URL, tmp_path)
    assert list(tmp_path.iterdir()) == []  # nothing cached


def test_redirect_to_http_is_refused(monkeypatch):
    monkeypatch.setattr(fm.urllib.request, "urlopen", lambda req, timeout: _Resp("http://catalog.archives.gov/x.jpg"))
    with pytest.raises(ValueError, match="M1"):
        fm.fetch(REC, URL, None)


def test_cache_is_keyed_by_the_url_hash(monkeypatch, tmp_path):
    import hashlib

    calls = []
    monkeypatch.setattr(fm.urllib.request, "urlopen", lambda req, timeout: calls.append(1) or _Resp(URL, b"abc"))
    assert fm.fetch(REC, URL, tmp_path) == b"abc"
    name = hashlib.sha256(URL.encode()).hexdigest() + ".jpg"
    assert [p.name for p in tmp_path.iterdir()] == [name]
    assert fm.fetch(REC, URL, tmp_path) == b"abc" and len(calls) == 1  # second call served from the cache
    other = "https://catalog.archives.gov/medialz/y/596270_001.jpg"  # same file name, different record
    monkeypatch.setattr(fm.urllib.request, "urlopen", lambda req, timeout: _Resp(other, b"xyz"))
    assert fm.fetch(REC, other, tmp_path) == b"xyz"
