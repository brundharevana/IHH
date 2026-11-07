# B11 - Artwork clearance for the scanned rooms

Date: 2026-10-13. Task 2 of `docs/superpowers/plans/2026-10-12-real-scan-museum.md` (Global Constraint "Artwork clearance", Review Focus 5). The per-artwork records below are the `artworks` lists in `content/scans/*.json`; this file adds the method and the reasoning. The gate is `python3 tools/content_check.py --scans`, run in the site prebuild.

## Result

| Room | Cleared | Cropped | Blocked | Usable |
|---|---|---|---|---|
| The King's Hall, Skokloster Castle | 27 | 2 | 0 | yes |
| The Dining Room, the Hallwyl Museum | 7 | 4 | 0 | yes |
| The Great Drawing Room, the Hallwyl Museum | 8 | 0 | 0 | yes |
| The Picture Gallery, the Hallwyl Museum | 0 | 0 | 2 | no |
| The Entrance Hall, Margam Castle | 0 | 0 | 4 | no |

Rooms that remain usable: the King's Hall (two portraits masked), the Hallwyl Dining Room (two window roundels and two safety signs masked) and the Hallwyl Great Drawing Room (nothing masked). The Picture Gallery and the Margam Entrance Hall are marked unusable; their bundles are no longer shipped.

## The rule (as enforced)

A room ships only if every artwork visible in it has a record with one of these decisions:

- **Cleared, death-year route.** A named artist, the year they died (`died`) and an authority record for it (`died_source`, here Wikidata), plus the museum's catalogue record (`evidence_url`). The artist must have died no later than the current year minus 71. Sweden (URL 43 §, EU Term Directive art. 1(1)) and the UK (CDPA s.12) protect a work for 70 years after the author's death, counted to the end of the year: a death in 1955 frees the work on 1 January 2026. A known death inside the term fails even if the work is old.
- **Cleared, dating route.** No death year (author unknown, or named without dates): the catalogue's dating, taken as the latest year of its range (`dated`), must be no later than the current year minus 191, with the catalogue record as evidence. Whoever made such a work would have had to live more than 120 years after making it to have died within the last 70 years, so the author's identity does not matter. The same bound covers the anonymous-work terms (70 years from lawful publication, and no protection if unpublished 70 years after creation: EU Term Directive art. 1(3) and 1(6), URL 44 §, CDPA s.12(3)), which can reach at most 140 years from creation. For 2026 the cut-off year is 1835.
- **Cropped.** The room's `crops` list holds an axis-aligned box (room metres, in the bundle's own frame) named by the artwork's `crop`. The build fills the texture region of every triangle whose centre lies in the box with one flat colour (the region's mean, grown by 2 texels so filtering and mipmaps never reach the artwork), records the hash of the crop list and the number of triangles and texels masked per box in each bundle, and then records the bundle's sha256. The gate checks that the hash matches the current crop list, that every box masked something, and that each shipped file matches its recorded sha256. The masking is listed in the CC BY "Changes:" note of the credit.
- **Blocked.** Anything else. A blocked artwork fails the gate unless the room is marked `"usable": false` with a reason, in which case nothing of the room may exist under `site/public/scans/<id>/`.

Difference from the task brief: the brief allowed an anonymous work to clear if the catalogue "dates the work 120+ years old and states anonymous". The gate is stricter on age (191 years, which is safe whoever the author is) and therefore does not need the catalogue to state that the work is anonymous. With 120 years, a work made in 1906 by a 20-year-old who lived to 90 would still be in copyright until 2046.

## Method

- **What is visible.** Each desktop bundle was rendered in a small three.js viewer (GLTFLoader, KTX2Loader, MeshoptDecoder from the site's own three 0.186) under headless Chromium: eight directions and the ceiling from the room centre, then close views wall by wall and head-on views of each painting, located by ray picks in room coordinates. The same viewer verified every crop after the rebuild, on the desktop and phone bundles.
- **What it is.** The Swedish National Historical Museums' collection search (samlingar.shm.se, JSON API `api/v1/search` and the object pages) for Skokloster and Hallwyl. For the King's Hall, the castle's own inventory numbers 609-632_SKO form the room's royal series; each painting seen in the scan was matched to a catalogue photograph. Olof Granberg's 1902 guide (*Skoklosters slott och dess samlingar*, Internet Archive) lists the room's portraits as of 1902, which confirmed the series and the artists. For Hallwyl, the object pages carry the museum's 1930-1937 catalogue texts, which name the room of each item ("Stora salongen", "Matsalen", "Galleriet").
- **When the artist died.** Wikidata entity records (P570), linked per artwork.
- **Non-art risks.** Modern signage was masked where it is legible (Dining Room exit sign and fire-safety sign). No identifiable people appear in any of the three usable scans (empty rooms). The Great Drawing Room's grand piano shows no legible maker's mark at scan resolution; a grey patch on one window is a scan hole, not a sign.

## Residual risks and judgement calls

- **King's Hall busts 609/611.** Two 17th-century bust copies (Gustav Vasa, Johan III) are too dark in the scan to tell apart; both records name no maker and date the copies to the 17th century, so either assignment clears.
- **Great Drawing Room tapestry borders.** The four 16th-century Brussels tapestries were repaired in 1896 and given partly new woven borders by Handarbetets vänner; the designer of the new borders is not named. The museum's record of the trial weaving says it repeats the original border's pattern and colours, so the 1896 work is treated as a copy of the 16th-century design, which carries no new copyright. If that reading is challenged, the borders would need masking.
- **King's Hall room fabric.** The painted floral joinery (doors, window recesses, dado) has no catalogue record of its own; it is cleared with the building's dating (1654-1676) and the catalogued gilt leather (1650-1700). A later repaint is possible but nothing points to the 20th century.
- **Ceiling attribution.** The museum's photo records name Hans Zauch (stucco, 1663-1664) and Nils Eriksson (painting of the stucco). Both are 17th-century; the ceiling clears on its dating either way.
- **Picture Gallery.** The museum's catalogue places Nils Asplund's 1905 ceiling decoration in the gallery; Asplund died in 1958, so it stays in copyright until the end of 2028. Masking the whole vault and every painting not identified one by one would leave nothing to show, so the room is unusable now. It could return from 2029 if every painting is matched to its catalogue record first.
- **Applied art not listed one by one.** Furniture, clocks, chandeliers and the porcelain in the Great Drawing Room's vitrine are not given individual records; the furniture records seen for the King's Hall (SKO 637-652) and the Dining Room date from the 16th to the 18th century, and none of these pieces carries a picture that reads as a painting at scan resolution.
- **Margam Entrance Hall.** Besides the unidentified glass and prints, Margam is not one of the plan's approved source accounts (Global Constraints: SkoklosterCastle, TheHallwylMuseum, Riksantikvarieambetet).

## The King's Hall, Skokloster Castle (`content/scans/kings-hall.json`)

| # | Artwork | Location in room | Artist | Life | Catalogue / evidence | Decision |
|---|---|---|---|---|---|---|
| 1 | Karl X Gustav on horseback (SKO 616) | west wall (-x), south end | Joachim von Sandrart | 1606-1688 | [record](https://samlingar.shm.se/object/77FFF9F5-31A0-42BF-B0AF-A451B5FA8703); death year: [Q551624](https://www.wikidata.org/wiki/Q551624) | cleared: artist died 1688 |
| 2 | Karl XI on horseback (SKO 619) | west wall (-x), centre | David Klöcker Ehrenstrahl | 1628-1698 | [record](https://samlingar.shm.se/object/165BC759-F877-4C48-ACC2-9AC6F2ECD8CB); death year: [Q902649](https://www.wikidata.org/wiki/Q902649) | cleared: artist died 1698 |
| 3 | Karl XII on horseback (SKO 620) | west wall (-x), north of centre | David von Krafft | 1655-1724 | [record](https://samlingar.shm.se/object/F0A140F9-28EE-462D-9EB8-39763AAA2EAF); death year: [Q586719](https://www.wikidata.org/wiki/Q586719) | cleared: artist died 1724 |
| 4 | Karl XI as a boy, full length (SKO 618) | west wall (-x), north end, upper | David Klöcker Ehrenstrahl | 1628-1698 | [record](https://samlingar.shm.se/object/600230E1-85C8-4C98-AEBA-46872892909F); death year: [Q902649](https://www.wikidata.org/wiki/Q902649) | cleared: artist died 1698 |
| 5 | Gustav II Adolf in a red hat (SKO 614) | west wall (-x), north corner, upper | Matthäus Merian the Elder | 1593-1650 | [record](https://samlingar.shm.se/object/24E68A8C-11FF-41F1-9245-C5C9D7520FA7); death year: [Q57968](https://www.wikidata.org/wiki/Q57968) | cleared: artist died 1650 |
| 6 | Queen Kristina against a red ground (SKO 3041) | west wall (-x), north corner, lower | David Beck | 1621-1656 | [record](https://samlingar.shm.se/object/55804A1E-E1BE-47A9-B200-03D7651D26D8); death year: [Q1173687](https://www.wikidata.org/wiki/Q1173687) | cleared: artist died 1656 |
| 7 | Gustav III (SKO 624) | north window wall (-z), west pier, upper | Lorens Pasch the Younger | 1733-1805 | [record](https://samlingar.shm.se/object/B0D99B3C-BD08-47C4-BC77-74DD800C0431); death year: [Q725347](https://www.wikidata.org/wiki/Q725347) | cleared: artist died 1805 |
| 8 | Adolf Fredrik (SKO 623) | north window wall (-z), east pier, upper | Lorens Pasch the Younger | 1733-1805 | [record](https://samlingar.shm.se/object/3C6298D4-EF44-4A8F-AF20-9F8B58A10111); death year: [Q725347](https://www.wikidata.org/wiki/Q725347) | cleared: artist died 1805 |
| 9 | Erik XIV, 17th-century bust copy (SKO 610) | north window wall (-z), east pier, lower | not named | unknown | [record](https://samlingar.shm.se/object/64A23E8B-297F-490A-9671-50582AF0A0AC) | cleared: dated 1699, no death year needed |
| 10 | Gustav Vasa or Johan III, 17th-century bust copy (SKO 609 / 611) | north window wall (-z), west pier, lower | not named | unknown | [record](https://samlingar.shm.se/object/72CD04E9-9971-424E-8C2B-8FC2BE9FACA0) | cleared: dated 1699, no death year needed |
| 11 | Johan III or Gustav Vasa, 17th-century bust copy (SKO 611 / 609) | east wall (+x), north corner group, lower left | not named | unknown | [record](https://samlingar.shm.se/object/50FBA971-2B06-4BAD-B7FD-263DB192D69A) | cleared: dated 1600, no death year needed |
| 12 | Sigismund, 17th-century bust copy (SKO 612) | east wall (+x), north corner group, lower middle | not named | unknown | [record](https://samlingar.shm.se/object/A1BC318D-F02F-4680-A206-A8EA836B9944) | cleared: dated 1699, no death year needed |
| 13 | Karl IX, 17th-century bust copy (SKO 613) | east wall (+x), north corner group, lower right | not named | unknown | [record](https://samlingar.shm.se/object/9098BF09-CA52-42FD-B7E1-90F6FF1DA6F7) | cleared: dated 1699, no death year needed |
| 14 | Karl XV in hussar uniform (SKO 629) | east wall (+x), north corner group, upper left | not named | unknown | [record](https://samlingar.shm.se/object/8C59D907-F23A-450A-ADF8-6261CF43D058) | cropped (`sko-629-karl-xv`) |
| 15 | Gustav V in profile (SKO 631) | east wall (+x), north corner group, upper right | Emil Österman and Bernhard Österman | 1871-1938 | [record](https://samlingar.shm.se/object/B94A6EA4-B2A6-4F13-A429-A259ABBDC17E); death year: [Q4391878](https://www.wikidata.org/wiki/Q4391878) | cleared: artist died 1938 |
| 16 | Queen Hedvig Eleonora seated, in black (SKO 617) | east wall (+x), over the north door | David Klöcker Ehrenstrahl | 1628-1698 | [record](https://samlingar.shm.se/object/633D28F1-56AE-4601-A2A1-8917DD04EC7B); death year: [Q902649](https://www.wikidata.org/wiki/Q902649) | cleared: artist died 1698 |
| 17 | Fredrik I, full length (SKO 622) | east wall (+x), north of the fireplace | Georg Engelhard Schröder | 1684-1750 | [record](https://samlingar.shm.se/object/78E87578-C952-4B23-B58E-2103C76DBC58); death year: [Q1504147](https://www.wikidata.org/wiki/Q1504147) | cleared: artist died 1750 |
| 18 | Apollo and Coronis, painted overmantel panel (SKO 13880) | east wall (+x), fireplace overmantel | not named | unknown | [record](https://samlingar.shm.se/object/762E3FB1-4E9C-4BCB-BCB4-B5F785987D70) | cleared: dated 1669, no death year needed |
| 19 | Painted fire screen with a palace interior (SKO 608) | east wall (+x), fireplace opening | Jean Le Pautre | 1618-1682 | [record](https://samlingar.shm.se/object/E2EBFCDB-E5A2-47CC-975C-C0EC29E82C00); death year: [Q290751](https://www.wikidata.org/wiki/Q290751) | cleared: artist died 1682 |
| 20 | Gustav VI Adolf seated (SKO 632) | east wall (+x), over the south door | Kurt Jungstedt | 1894-1963 | [record](https://samlingar.shm.se/object/8A5F4402-BC53-4436-AB64-4C6D19A4C56C); death year: [Q5894434](https://www.wikidata.org/wiki/Q5894434) | cropped (`sko-632-gustav-vi-adolf`) |
| 21 | Oscar II in admiral's uniform (SKO 630) | east wall (+x), south corner, upper | Oscar Björck | 1860-1929 | [record](https://samlingar.shm.se/object/2AF9339A-0EFA-48F5-ABC9-59E3ED8B75BC); death year: [Q282512](https://www.wikidata.org/wiki/Q282512) | cleared: artist died 1929 |
| 22 | Karl XIII with the bust of Karl Johan (SKO 626) | east wall (+x), south corner, lower | Per Krafft the Younger | 1777-1863 | [record](https://samlingar.shm.se/object/323B1870-C274-4B15-9AC9-4BA368495F8C); death year: [Q927593](https://www.wikidata.org/wiki/Q927593) | cleared: artist died 1863 |
| 23 | Oscar I as crown prince (SKO 628) | south window wall (+z), east pier, upper | Fredric Westin | 1782-1862 | [record](https://samlingar.shm.se/object/B69DCDB2-3061-4873-8A7E-8327F9266D3B); death year: [Q1453234](https://www.wikidata.org/wiki/Q1453234) | cleared: artist died 1862 |
| 24 | Queen Desideria (SKO 3352) | south window wall (+z), east pier, lower | Fredric Westin | 1782-1862 | [record](https://samlingar.shm.se/object/0FDB906E-3997-4C87-BD94-1B6708D5C713); death year: [Q1453234](https://www.wikidata.org/wiki/Q1453234) | cleared: artist died 1862 |
| 25 | Queen Josefina (SKO 3351) | south window wall (+z), west pier, upper | Olof Johan Södermark | 1790-1848 | [record](https://samlingar.shm.se/object/AFEAF763-0457-46A0-A080-F0696BD95ED0); death year: [Q1658721](https://www.wikidata.org/wiki/Q1658721) | cleared: artist died 1848 |
| 26 | Karl XIV Johan (SKO 627) | south window wall (+z), west pier, lower | Olof Johan Södermark | 1790-1848 | [record](https://samlingar.shm.se/object/16371565-C299-4E04-BBD7-4670D2454F20); death year: [Q1658721](https://www.wikidata.org/wiki/Q1658721) | cleared: artist died 1848 |
| 27 | Painted stucco ceiling: Jason and the dragon, the four continents, the Wrangel and von Haugwitz monograms | ceiling | Hans Zauch (stucco); painting attributed to Nils Eriksson in the museum's photo record | unknown | [record](https://commons.wikimedia.org/wiki/File:Kungssalen_-_Skoklosters_slott_-_30913.tif) | cleared: dated 1664, no death year needed |
| 28 | Carved and painted fireplace (Markus Hebel) and relief-tiled stove | east wall (+x) | Markus Hebel (carving) | unknown | [record](https://commons.wikimedia.org/wiki/File:Kungssalen_-_Skoklosters_slott_-_30913.tif) | cleared: dated 1670, no death year needed |
| 29 | Room fabric: gilt-leather wall hangings (SKO 633), painted joinery, limestone floor | walls and floor | not named | unknown | [record](https://samlingar.shm.se/object/5D925715-BDAD-42A7-A3CD-775FEF9D360A) | cleared: dated 1700, no death year needed |

Notes:

- 10: Too dark in the scan to tell which of the two 17th-century bust copies hangs here; the other hangs in the north-east corner group. Both records (609_SKO dated 1600-1699, 611_SKO dated 1600) name no maker and date the work to the 17th century, so the clearance is the same either way.
- 11: See the west-pier bust: 609_SKO and 611_SKO, both 17th-century copies with no maker named.
- 14: The catalogue names no painter and dates the portrait 1850-1872: too recent to clear without an identified artist and death year. Masked.
- 15: The record names both twins (Carl Emil Österman, died 1927, https://www.wikidata.org/wiki/Q4392193; Gustaf Bernhard Österman, died 1938); the later death year is used.
- 19: The catalogue names Jean Lepautre (the design source); the screen is dated 1659-1700.
- 20: Painted 1960-61 by Kurt Jungstedt (died 1963): in copyright until the end of 2033. Masked.
- 27: The museum's photo record (LSH photo 30913, republished by the museum on Wikimedia Commons) states the stucco ceiling was made by Hans Zauch in 1663-1664; LSH photo 88015 names Nils Eriksson for the painted stucco. Zauch died 1666 (https://www.wikidata.org/wiki/Q30331456).
- 28: The same museum record: wooden fireplace with sculptures by Markus Hebel (1663), screens decorated by Johan Malchow, and a stove with reliefs by Hindrich Thim (1670). Hebel died 1664 (https://www.wikidata.org/wiki/Q27300028).
- 29: The gilt leather is catalogued 1650-1700; the castle was built 1654-1676 (https://skoklostersslott.se/skoklosters-slotts-historia/).

Crop boxes (room metres, the bundle's own frame; applied by `tools/build_scans.py` before texture encoding):

| Box | Covers | min [x, y, z] | max [x, y, z] | Triangles masked | Texels masked (desktop / phone) |
|---|---|---|---|---|---|
| `sko-629-karl-xv` | Karl XV portrait (SKO 629) | [6.35, 3.32, -9.32] | [7.15, 4.57, -8.3] | 1655 | 11158 / 5209 |
| `sko-632-gustav-vi-adolf` | Gustav VI Adolf portrait (SKO 632) | [6.7, 3.8, 5.68] | [7.45, 5.25, 6.85] | 1300 | 7994 / 2545 |

## The Dining Room, the Hallwyl Museum (`content/scans/hallwyl-dining-room.json`)

| # | Artwork | Location in room | Artist | Life | Catalogue / evidence | Decision |
|---|---|---|---|---|---|---|
| 1 | Diana, painting set into the panelling over the fireplace (HWY XXXII:A.d.03) | over the marble fireplace | Julius Kronberg | 1850-1921 | [record](https://samlingar.shm.se/object/505CFE79-F035-428E-8963-687ABF634E5F); death year: [Q1604937](https://www.wikidata.org/wiki/Q1604937) | cleared: artist died 1921 |
| 2 | Large verdure tapestry over the sideboard (HWY LIX:I:A.01, one of a pair) | long wall over the sideboard | not named | unknown | [record](https://samlingar.shm.se/object/2C56938F-619C-480E-8575-AB0363C7D909) | cleared: dated 1799, no death year needed |
| 3 | Smaller verdure tapestry with a woven extension of 1897 (HWY LIX:I:A.01, the other of the pair) | short wall next to the door with the exit sign | Bror Almquist (cartoon for the 1897 extension) | 1864-1940 | [record](https://samlingar.shm.se/object/AE2F19F8-ECC5-45FF-ACC3-D2543AFD5466); death year: [Q5547516](https://www.wikidata.org/wiki/Q5547516) | cleared: artist died 1940 |
| 4 | Panelled interior, coffered ceiling and carved door crests designed by Isak Gustaf Clason (drawings HWY LXIV:III:B.b.b.70, .72) | walls, doors and ceiling | Isak Gustaf Clason | 1856-1930 | [record](https://samlingar.shm.se/object/3C3658D8-9456-434F-9906-480BFAEDC2FF); death year: [Q931295](https://www.wikidata.org/wiki/Q931295) | cleared: artist died 1930 |
| 5 | Carved sideboard (HWY VI:I:A.b.01) | long wall under the large tapestry | not named | unknown | [record](https://samlingar.shm.se/object/F9C9E5FB-F886-45AD-A01A-1E2D1D3F86BB) | cleared: dated 1620, no death year needed |
| 6 | Inlaid Renaissance chest (HWY VI:I:F.a.a.03) | under the windows | not named | unknown | [record](https://samlingar.shm.se/object/E5209679-D5BD-4D33-B93E-B0DE19794A85) | cleared: dated 1630, no death year needed |
| 7 | Long-case clock (HWY VI:V:B.a.02) | corner by the windows | not named | unknown | [record](https://samlingar.shm.se/object/FB66751A-8091-4D0F-A51C-85AEF789FAE0) | cleared: dated 1699, no death year needed |
| 8 | Painted glass roundel in the leaded window (left) | window bay, second light | not named | unknown | none found | cropped (`hwy-dining-roundel-1`) |
| 9 | Painted glass roundel in the leaded window (right) | window bay, third light | not named | unknown | none found | cropped (`hwy-dining-roundel-2`) |
| 10 | Green emergency-exit sign (ISO 7010 running-man pictogram) over the door | short wall, over the door | not named | unknown | none found | cropped (`hwy-dining-exit-sign`) |
| 11 | Red fire-safety sign on a pilaster | pilaster by the double door, about 1 m up | not named | unknown | none found | cropped (`hwy-dining-fire-sign`) |

Notes:

- 2: French, 18th century (catalogue: 1700-1799); the record also lists Handarbetets vänner, the Stockholm textile association that mounted and extended the pair in the 1890s (see the smaller tapestry).
- 3: The tapestry is 18th-century French (record 2C56938F-619C-480E-8575-AB0363C7D909). The museum's 1937 catalogue text on this record says the cartoon for the extension woven in 1897 by Handarbetets vänner was drawn in 1896 by the architect Bror Eduard Almquist in I. G. Clason's office.
- 8: No catalogue record found for the window roundels (searched the museum's collection for glass paintings and window panes); maker and date unknown. Masked.
- 9: As the left roundel. Masked.
- 10: Non-art risk: modern signage with a standard pictogram. Masked.
- 11: Non-art risk: modern signage. Masked.

Crop boxes (room metres, the bundle's own frame; applied by `tools/build_scans.py` before texture encoding):

| Box | Covers | min [x, y, z] | max [x, y, z] | Triangles masked | Texels masked (desktop / phone) |
|---|---|---|---|---|---|
| `hwy-dining-roundel-1` | window roundel, left | [-2.96, 1.81, -1.26] | [-2.56, 2.21, -0.86] | 464 | 6167 / 2311 |
| `hwy-dining-roundel-2` | window roundel, right | [-2.37, 1.81, -2.43] | [-1.97, 2.21, -2.03] | 370 | 5965 / 2279 |
| `hwy-dining-exit-sign` | exit sign | [-0.72, 1.84, 4.6] | [-0.38, 2.08, 4.9] | 1014 | 7975 / 3822 |
| `hwy-dining-fire-sign` | fire-safety sign | [-0.72, 0.9, -4.52] | [-0.48, 1.13, -4.26] | 491 | 4024 / 1889 |

## The Great Drawing Room, the Hallwyl Museum (`content/scans/hallwyl-great-drawing-room.json`)

| # | Artwork | Location in room | Artist | Life | Catalogue / evidence | Decision |
|---|---|---|---|---|---|---|
| 1 | Ceiling painting, Open Air Concert (HWY XXXII:A.b.02) | centre of the ceiling | Julius Kronberg | 1850-1921 | [record](https://samlingar.shm.se/object/B3B05D50-53BF-4093-A878-2B4E106B1A23); death year: [Q1604937](https://www.wikidata.org/wiki/Q1604937) | cleared: artist died 1921 |
| 2 | Marble relief over the fireplace, Prometheus brings fire to mankind (HWY LV:II:B.a.01) | over the fireplace | Gusten Lindberg | 1852-1932 | [record](https://samlingar.shm.se/object/3DE0EED7-9B39-4E5F-9A4C-20D814096470); death year: [Q5953564](https://www.wikidata.org/wiki/Q5953564) | cleared: artist died 1932 |
| 3 | Marble door-overpiece relief, Poetry (HWY LV:II:B.a.02) | over one of the three doors | Gusten Lindberg | 1852-1932 | [record](https://samlingar.shm.se/object/6CCB797C-6B01-4231-A447-B1FD42A6253C); death year: [Q5953564](https://www.wikidata.org/wiki/Q5953564) | cleared: artist died 1932 |
| 4 | Marble door-overpiece relief, Music (HWY LV:II:B.a.03) | over one of the three doors | Gusten Lindberg | 1852-1932 | [record](https://samlingar.shm.se/object/9F0D4D42-7BDF-4A51-8687-1CD00641F150); death year: [Q5953564](https://www.wikidata.org/wiki/Q5953564) | cleared: artist died 1932 |
| 5 | Marble door-overpiece relief, The Visual Arts (HWY LV:II:B.a.04) | over one of the three doors | Gusten Lindberg | 1852-1932 | [record](https://samlingar.shm.se/object/935A7E35-1F22-4D68-8E6C-A34472277F4F); death year: [Q5953564](https://www.wikidata.org/wiki/Q5953564) | cleared: artist died 1932 |
| 6 | Two gilt-bronze putti candle-holders on the fireplace (HWY LV:I:B.a.03) | either side of the fireplace frieze | Gusten Lindberg | 1852-1932 | [record](https://samlingar.shm.se/object/80BD2E97-D535-4ADF-A258-83A6D24513BB); death year: [Q5953564](https://www.wikidata.org/wiki/Q5953564) | cleared: artist died 1932 |
| 7 | Four Brussels tapestries from the series Odysseus and Nausicaa (HWY LIX:I:A.02, tapestries 2-5) | the four tapestry wall fields | not named | unknown | [record](https://samlingar.shm.se/object/5409644C-7216-40A6-AE80-BB8239B4EB9E) | cleared: dated 1600, no death year needed |
| 8 | Interior architecture: gilded panelling, coffered ceiling frame, fireplace, designed by Isak Gustaf Clason (drawing HWY LXIV:III:B.b.b.64) | walls and ceiling | Isak Gustaf Clason | 1856-1930 | [record](https://samlingar.shm.se/object/6E4ACE5C-59F3-406D-9667-5EA79CABBE46); death year: [Q931295](https://www.wikidata.org/wiki/Q931295) | cleared: artist died 1930 |

Notes:

- 7: Brussels, second half of the 16th century (catalogue: 1560-1600). Repaired in 1896 by Handarbetets vänner, which wove partly new borders; the museum's record of the trial weaving (https://samlingar.shm.se/object/412BA408-BEED-4F5E-B133-3A837FD1D392) states it repeats the material, technique, pattern and colours of the original border, so the 1896 work copies the 16th-century design.

## The Picture Gallery, the Hallwyl Museum (`content/scans/hallwyl-picture-gallery.json`)

**Unusable.** The painted ceiling over the whole gallery vault is by Nils Asplund (1905; he died in 1958, so it is in copyright until the end of 2028), and the paintings hung frame to frame on every wall (many dozens) have not been identified one by one. Masking the ceiling and every unidentified painting would leave no room to show. Its bundles were removed from `site/public/scans/`; the manifest keeps the source provenance.

| # | Artwork | Location in room | Artist | Life | Catalogue / evidence | Decision |
|---|---|---|---|---|---|---|
| 1 | Painted ceiling decoration over the whole gallery vault (HWY XXXII:A.b.03) | ceiling | Nils Asplund | 1874-1958 | [record](https://samlingar.shm.se/object/24E56E66-EC94-451A-BD6E-BAAF0D4AFA4D); death year: [Q5561490](https://www.wikidata.org/wiki/Q5561490) | blocked (room unusable) |
| 2 | Dutch, Flemish and other paintings hung frame to frame on every wall (many dozens) | all walls | not named | unknown | none found | blocked (room unusable) |

Notes:

- 1: The museum's 1930 catalogue text places it in the gallery ('Galleriet'); signed NILS ASPLUND 1905. In copyright until the end of 2028.
- 2: Not individually identified against the museum's catalogue (the collection's location data is not searchable by room).

## The Entrance Hall, Margam Castle (`content/scans/margam-entrance-hall.json`)

**Unusable.** Its heraldic stained-glass windows, the room's main feature, have no identified maker or date (the Cadw listing describes the glass but names neither), and the framed prints are unidentified. Masking the windows would leave a bare hall; the source is also outside the plan's approved accounts (Skokloster, Hallwyl, Riksantikvarieambetet). Its bundles were removed from `site/public/scans/`; the manifest keeps the source provenance.

| # | Artwork | Location in room | Artist | Life | Catalogue / evidence | Decision |
|---|---|---|---|---|---|---|
| 1 | Heraldic stained-glass windows | the two large windows | not named | unknown | [record](https://britishlistedbuildings.co.uk/300014170-margam-castle-margam) | blocked (room unusable) |
| 2 | Two framed purple-toned prints of a landscape and a house | walls either side of the fireplace | not named | unknown | none found | blocked (room unusable) |
| 3 | Two brass interpretation plaques with text | walls | not named | unknown | none found | blocked (room unusable) |
| 4 | Green emergency-exit sign | by the main door | not named | unknown | none found | blocked (room unusable) |

Notes:

- 1: Cadw listing 14170 records stained glass with figures and heraldic emblems; no maker or date found.
- 2: Unidentified.
- 3: Non-art risk: modern text plaques.
- 4: Non-art risk: modern signage.
