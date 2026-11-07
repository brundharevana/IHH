// Exhibit media files in /media/ (site/public/media/): <key>.jpg images and <key>.glb document
// models. The key is the media record id, or <id>-p<page> for one page of a multi-page record
// (exhibit "page" for a framed image; "pages": [front, back?] for a 360 document, whose GLB is
// <id>-p<front>-<back>). Shared by the page build (load.js), the room runtime (scene.js, room.js,
// reconstruction.js) and the GLB exporter (scripts/export-docs.mjs).
// Room textures are smaller copies (long side <= 768 px, tools/fetch_media.py) to fit the phone
// texture budget; the panel shows the <= 2048 px file.
export const roomTextureUrl = key => `/media/room/${key}.jpg`;
export const panelImageUrl = key => `/media/${key}.jpg`;
export const modelUrl = key => `/media/${key}.glb`;

export const pageKey = (id, page) => (page ? `${id}-p${page}` : id);

export function exhibitFiles(ex) {
  if (!ex.media_id) return { front: null, back: null, model: null };
  if (ex.type === '360-document') {
    const [front, back] = ex.pages || [];
    return {
      front: pageKey(ex.media_id, front),
      back: back ? pageKey(ex.media_id, back) : null,
      model: ex.pages && ex.pages.length ? `${ex.media_id}-p${ex.pages.join('-')}` : ex.media_id,
    };
  }
  return { front: pageKey(ex.media_id, ex.page), back: null, model: null };
}
