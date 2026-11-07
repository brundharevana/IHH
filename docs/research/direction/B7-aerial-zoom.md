# B7 - Aerial zoom spike: globe -> city -> street -> building

Date: 2026-10-10. Spike only; no product code. All "accessed" dates 2026-10-10. Proof files: `<session scratchpad>/spike-aerial/` (called `S/` below).

Confidence tags: [H] verified by live request or primary text this session, [M] from a fetched summary of a primary page, [L] inference / not verified.

## 1. Imagery per location

| Place | Source | Licence (exact text where obtained) | Keyless GetMap | Verified fetch |
|---|---|---|---|---|
| Princeton, Trenton, DC, San Diego (US) | USGS NAIP via The National Map ImageServer | "USGS-authored or produced data and information are considered to be in the U.S. Public Domain." Credit requested: "U.S. Geological Survey / Department of the Interior/USGS". Service copyright string: "USGS, USDA, The National Map: Orthoimagery. January 09, 2025." [M/H] | `https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?bbox=minx,miny,maxx,maxy&bboxSR=3857&imageSR=3857&size=1024,1024&format=jpgpng&f=image` (max 4000x4000). No key. [H] | Princeton 4 levels, DC 4 levels, San Diego 3 of 4 (see below) |
| Bern | swisstopo SWISSIMAGE (10 cm plains, 25 cm Alps, 3-year cycle) | OGD terms: "may be used, distributed and made accessible ... [and] used commercially". Source line must be one of: "Federal Office of Topography swisstopo" or "(c)swisstopo" (translations allowed). "In the event of excessive use of the geoservices infrastructure, access may be restricted or refused." [M] | `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ch.swisstopo.swissimage&STYLES=&CRS=EPSG:3857&BBOX=...&WIDTH=1024&HEIGHT=1024&FORMAT=image/jpeg`. No key. [H] | Bern Bundesplatz, 4 levels |
| Ulm (BW side) | LGL Baden-Wuerttemberg DOP20 | From the service's own GetCapabilities: Fees "Unentgeltliche Nutzung nach Open Data Lizenz"; AccessConstraints "Es gelten die Lizenzbedingungen 'Datenlizenz Deutschland - Namensnennung - Version 2.0' bzw. 'dl-de/by-2-0' ... Als Rechteinhaber und Bereitsteller ist die Datenhaltende Stelle, sowie das Jahr des Datenbezugs in Klammern anzugeben. Beispiel fuer Quellenvermerk: LGL-BW (2024) Datenlizenz Deutschland - Namensnennung - Version 2.0, www.lgl-bw.de" [H] | `https://owsproxy.lgl-bw.de/owsproxy/ows/WMS_LGL-BW_ATKIS_DOP_20_C?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=IMAGES_DOP_20_RGB&STYLES=&CRS=EPSG:3857&BBOX=...&WIDTH=1024&HEIGHT=1024&FORMAT=image/jpeg` (MaxWidth 15000). No key. [H] | Ulm Muenster, 4 levels |
| Wide zooms (any) | EOX Sentinel-2 cloudless | **Not CC BY 4.0 for current years.** 2024 layer is "CC BY-NC-SA 4.0"; commercial use needs "EOX Commercial Attribution-RestrictedUse". Required line: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data <year>)". [M, search summary + license page; the brief's CC BY 4.0 assumption is wrong] | `https://tiles.maps.eox.at/wms?service=WMS&version=1.1.1&request=GetMap&layers=s2cloudless-2024_3857&srs=EPSG:3857&bbox=...&width=1024&height=1024&format=image/jpeg` (layer name needs the `_3857` suffix; without it I got 256 px tiles). [H] | DC 10 km and 40 km fetched |

Important gotchas:
- **Germany BKG DOP20 (geodatenzentrum, `sgx.geodatenzentrum.de/wms_dop40`) is NOT open**: BKG's own terms say licensing for third parties is "gegen Entgelt" via ZSGT; the unauthenticated endpoint returned ERROR_UNKNOWN_SERVICE. Use the state-level LGL-BW service above (open, dl-de/by-2.0). [H]
- **Ulm coverage ends at the Danube**: the BW DOP is blank (white) over Neu-Ulm / Bavaria (see `S/ulm_montage.jpg`). Keep the Ulm pin on the BW bank (Muenster) and keep the 10 km extent shifted or accept the white wedge (mask with Sentinel-2 or hide the edge). Bavaria publishes its own open DOP (CC BY 4.0, not verified here). [H for blank, L for Bavaria]
- NAIP is 0.6 m (some states 1 m) and USGS gateways returned 502/504 on 2 of 12 requests; a retry fixed both. Build script needs retries and a polite delay. [H]
- NAIP on-demand extent: city (10 km) and hood (2 km) are readable but soft; street (300 m) and building (80 m) are at native ~0.6 m, so the 80 m tile is upsampled ~6x (1024 px over 80 m = 7.8 cm/px vs 60 cm native). Building view shows roofs plainly but not facade detail. Swiss/BW 10-20 cm imagery is far crisper. [H]
- Mercator note: in EPSG:3857 a ground distance D spans D / cos(lat) metres of map units; the scripts multiply the bbox by 1/cos(lat) so the images are true-scale. Images are north-up and square.
- Bulk/scripted download: USGS and swisstopo terms permit use with a fair-use caveat (no explicit scripted-download ban found); LGL-BW is open data. A handful of images (about 5 locations x 4 requests) is far below any fair-use threshold. [M]

## 2. Street-name labels

- **OSM raster tiles** (`tile.openstreetmap.org`): forbidden for this. Policy text: "Bulk downloading is any pre-emptive fetching of tiles other than those a user is actively viewing." Attribution: "(c) OpenStreetMap contributors". Do not use. [M]
- **OpenFreeMap** (`tiles.openfreemap.org/planet`, tilejson responds, keyless): Attribution text: "OpenFreeMap (c) OpenMapTiles Data from OpenStreetMap". ToS fetched says users may not "attempt to collect data from the service in automated ways without permission" and the service "may discontinue at any time". Build-time rendering of a handful of tiles is borderline; if used, ask permission or self-host (they publish planet images). I did not use it. [M]
- **Overpass API (used in proof)**: public instance `overpass-api.de`: fair use "less than 10,000 queries per day", identify with User-Agent, "Commercial use requires self-hosted or paid servers". One query per location per build is trivial. Data licence is ODbL (OSM); attribution "(c) OpenStreetMap contributors". Reliability: first call timed out ("dispatcher timeout"), retry on the same host succeeded. [M/H]
- **Recommended method**: Overpass `way["highway"]["name"](bbox);out geom;` -> project to the same extent as the aerial -> render labels. Proof used Pillow (rotated bold text with dark stroke, one label per street, placed on the longest in-view segment) as transparent WebP overlays. Production alternative: emit SVG `<textPath>` and rasterise with sharp/resvg for crisper type. Labels as a separate transparent layer (11-26 KB WebP) means the aerial stays clean and labels can fade in at street level. Not tested: MapLibre headless render (heavier, needs GPU/Chrome, no gain for ~10 images). [H for Pillow path]
- Sources: https://operations.osmfoundation.org/policies/tiles/ , https://openfreemap.org/tos/ , https://openfreemap.org/quick_start/ , https://wiki.openstreetmap.org/wiki/Overpass_API (all accessed 2026-10-10).

## 3. Proof (112 Mercer Street = Albert Einstein House, Nominatim 40.34336, -74.66678, OSM way 487450913)

Files in `S/`:
- Aerial: `naip_city.jpg` (10 km), `naip_hood.jpg` (2 km), `naip_street.jpg` (300 m), `naip_building.jpg` (80 m); montage `montage.jpg`.
- Labels: `labels_hood.webp`, `labels_street.webp`, `labels_building.webp` (+ PNG); composites `composite_{hood,street,building}.jpg`, montage `composite_montage.jpg`.
- Other locations: `bern_*.img` (JPEG), `bern_eox_montage.jpg`; `ulm_*.jpg`, `ulm_montage.jpg`; `naip_dc_*.jpg`, `naip_sd_*.jpg`, `dc_sd_montage.jpg`; `eox_dc_city.jpg`, `eox_dc_hood.jpg`; `gibs_dc.jpg` (NASA GIBS Landsat, test).
- Read and confirmed visually: Princeton house is identifiable at 80 m (white roof beside Mercer St), Mercer Street label rotates correctly with the road at street and building levels. Hood-level labels only cover part of the frame because my Overpass bbox was deliberately small (about 0.9 km wide); production must query the full extent. Bern 80 m shows individual roof tiles and trams; Ulm 80 m shows Muenster roof detail; DC 80 m shows the White House roof.
- San Diego: my first test point landed in the bay (`naip_sd_building.jpg` is water). Use Broadway Pier approx 32.7140, -117.1750; street level shows the harbour piers fine.

Sizes, 4 images at 1024 px, WebP quality 75 (aerial only):

| Location | WebP |
|---|---|
| Princeton | 471 KB |
| Bern | 725 KB |
| Ulm | 659 KB |
| Washington DC | 787 KB |
| San Diego (point partly water) | 367 KB |
| Trenton (estimate, similar to Princeton) | about 500 KB |
| + labels per location (3 overlays) | about 50 KB |

## 4. three.js transition options

(Library docs via Context7 were not queried in this spike; the approach below uses long-standing core three.js APIs only: PerspectiveCamera, Mesh/PlaneGeometry, MeshBasicMaterial with transparent+opacity, TextureLoader. Verify against current docs when implementing.)

1. **Recommended: dolly + cross-fade to a tangent-plane quad stack.** On pin click, tween camera along the pin normal to a distance where the globe fills the screen near that point. Place one `PlaneGeometry` per zoom level, tangent to the sphere at the pin (position = pin direction * radius, `lookAt(origin)`, rotated so north is up; edge length = real extent scaled to globe units: 10 km on an Earth-radius 1 sphere is 0.00157, so levels are tiny and need a near-plane/log-depth setup, or scale the stack up and fly to a local scene). Each level is a transparent textured plane slightly offset along the normal (to avoid z-fighting, `depthWrite=false`, `renderOrder` ascending). As camera distance shrinks, fade level n in and level n-1 out with `opacity = smoothstep` of distance ratio; add labels only at street and building. One draw call per plane, 4-8 textures, around 1-3 MB: fine on phones.
2. **Simpler variant:** at the end of the globe zoom, cut to a flat 2D scene (orthographic camera, same stack scaled by a single zoom value, pinch/drag supported). Easiest to make smooth, but a visible scene change.
3. **Quad-tree / tiled XYZ**: needs a server or thousands of files; overkill for 5 pins. Not recommended.

Phones: textures 1024 px at 4 levels is about 16 MB GPU (RGBA) per location; dispose after leaving. Use `colorSpace = SRGBColorSpace`, mipmaps on, `anisotropy` low. Pre-decode with `createImageBitmap` before starting the dolly to avoid a hitch.

## 5. Budget and attribution

Per location 4 aerial images + 3 label overlays: 0.4-0.8 MB (Princeton 0.5, Bern 0.8, Ulm 0.7, DC 0.8, San Diego 0.4, Trenton 0.5). Five or six locations: about 3.5-4 MB total, all committed as static files. Optional 5th wider level from Sentinel-2 or NASA GIBS adds about 0.2 MB per location.

Attribution text for the page (credits panel):
- US aerial: "Imagery: U.S. Geological Survey, USDA NAIP, The National Map (public domain)."
- Bern: "Aerial imagery (c)swisstopo".
- Ulm: "Luftbild: LGL-BW (2024) Datenlizenz Deutschland - Namensnennung - Version 2.0, www.lgl-bw.de" (replace 2024 with the actual acquisition year from the service metadata).
- Street names: "Map data (c) OpenStreetMap contributors (ODbL)".
- Globe: NASA Blue Marble / NASA Earth Observatory, credit as that dataset requires.
- Optional wide zooms: Sentinel-2 cloudless needs the EOX line above and is non-commercial/ShareAlike; the NASA GIBS Landsat test (`gibs_dc.jpg`) is the public-domain alternative. [L: GIBS licence not verified here]

## Concerns

- EOX Sentinel-2 cloudless is CC BY-NC-SA 4.0 (non-commercial, share-alike), not CC BY. Fine for a competition entry only if the project is non-commercial, and ShareAlike may attach to derived textures. Safer: skip it, or use NASA GIBS or the aerial services above for all four zoom levels.
- Ulm: BW DOP stops at the Danube; BKG DOP is paid. Keep the framing on the BW side.
- NAIP resolution tops out at about 0.6 m, so the "building" level is soft; Bern and Ulm look much better. Consider a 150 m building extent for the US pins.
- Overpass and USGS servers were flaky; the build script needs retries and the committed output must be reproducible once, not run at deploy time.
- Pre-render labels once, commit; do not call any map service at runtime (OSM and OpenFreeMap terms discourage automated collection).
- Place coordinates for Trenton and the exact San Diego pier point were not fetched/confirmed.

## Recommendation (marked as such)

RECOMMENDATION: Pre-render, per pin, four 1024 px WebP aerials (10 km, 2 km, 300 m, 80-150 m) from USGS NAIP (US), swisstopo SWISSIMAGE (Bern) and LGL-BW DOP20 (Ulm), plus a transparent street-label WebP built from one Overpass query per location, and commit them (about 0.5-0.8 MB per pin). In three.js, dolly the camera down the pin normal while cross-fading a stack of tangent-plane textured quads, adding labels at street and building level. Credit USGS/NAIP, (c)swisstopo, LGL-BW (year) dl-de/by-2.0 and OpenStreetMap contributors (ODbL) in a credits panel. Avoid EOX Sentinel-2 for anything non-trivial unless the project is clearly non-commercial; use the aerial 10 km level as the widest image instead.

## Sources (accessed 2026-10-10)

- https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits
- https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer
- https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices
- https://www.swisstopo.admin.ch/en/orthoimage-swissimage-10
- https://www.geo.admin.ch/en/geo-services/geo-services/terms-of-use.html
- https://owsproxy.lgl-bw.de/owsproxy/ows/WMS_LGL-BW_ATKIS_DOP_20_C?REQUEST=GetCapabilities&SERVICE=WMS
- https://sg.geodatenzentrum.de/web_public/gdz/lizenz/deu/nutzungsbedingungen_dop.pdf
- https://cloudless.eox.at/documentation/license , https://eox.at/2025/03/sentinel-2-cloudless-2024/
- https://operations.osmfoundation.org/policies/tiles/ , https://openfreemap.org/tos/ , https://openfreemap.org/quick_start/ , https://wiki.openstreetmap.org/wiki/Overpass_API
