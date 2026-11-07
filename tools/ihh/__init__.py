"""Shared code for the verified inductee pipeline (docs/pipeline/SPEC.md).

Modules:
- paths      per-inductee folder layout (SPEC section 2)
- schema     the record schema (SPEC section 3), shared by validate.py and the write boundary
- records    JSON / JSON Lines load and save with a file lock and atomic replace; checks each
             record against schema before it is written
- normalize  text normalization, date parsing, number words
- ids        namespaced record ids (<CODE>-F-0001 and so on)
- gates      deterministic gates G1, G2, G5, G7, G9, G11 and the G10 helper

Python 3.12 standard library only.
"""
