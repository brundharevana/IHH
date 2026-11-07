"""The shipped package data obeys the rules the tools enforce (SPEC section 5, last paragraph).

Rule: every inductee folder under the data folder passes `validate.py --all` (schema, ids,
references, snapshots and every deterministic gate). A rule change (a schema field, a gate)
therefore lands together with the repair of every record on file that it flags: the record is
fixed, recategorized or withdrawn through tools/ihh/records.py, never left failing and never
excused by weakening the rule. The write boundary stops a new bad record; this test stops an old
one from outliving the rule that condemns it.

The data folder is the tools' own (ihh.paths.data_dir(): $IHH_DATA_DIR, else the repo's data/).
"""

import validate
from ihh import paths


def test_shipped_data_folder_has_inductees():
    # Guards the test below against passing on an empty or misplaced data folder.
    assert paths.list_slugs(), f"no inductees under {paths.data_dir() / 'inductees'}"


def test_shipped_data_passes_validate_all(capsys):
    code = validate.main(["--all", "--data-dir", str(paths.data_dir()), "--quiet"])
    out = capsys.readouterr().out
    problems = [line for line in out.splitlines() if line.startswith(("ERROR", "FAIL"))]
    assert code == 0 and not problems, "shipped data fails validate --all:\n" + "\n".join(problems)
