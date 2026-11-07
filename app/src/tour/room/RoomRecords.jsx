// The records a rebuilt room shows at its stops (roomRecords.js says which and where): each cleared
// record framed at its stop (lying on a desk, upright on a wooden easel, or hung), a link-only record as
// a labelled card, and a labelled panel stop as a printed card on a stand. Lit by the room's scene lights (the rooms themselves are baked). The images are the
// records' own cleared files (the ones the viewer opens), drawn down to at most 1024 px (768 on a
// phone) for the room. Clicking one picks its stop.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useScopedTexture } from '../../shared/loadHooks.js'
import { StageSuspense } from '../stageLoading.jsx'
import { useTextCard } from '../place/textCard.js'
import { declaredRecordIds, roomRecordStops, fitRecord } from './roomRecords.js'
import { imageOk, imageUrl, useRecordDraw } from '../recordDraws.js'
import INDEX from '../data/facts.generated.json'

const FRAME = '#2a1f17'
const MAT = '#efe6d2'

// the record's image, drawn down for the room (the full file stays the viewer's)
function useRoomImage(src, phone) {
  const tex = useScopedTexture(src)
  return useMemo(() => {
    const img = tex.image
    const max = phone ? 768 : 1024
    const w = img?.width || 1
    const h = img?.height || 1
    const k = Math.min(1, max / Math.max(w, h))
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(w * k))
    c.height = Math.max(1, Math.round(h * k))
    if (img) c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    // dev only (recordDraws.js): the record file this canvas was drawn from
    if (import.meta.env.DEV) t.userData = { drawnFrom: tex.userData?.fetchedFrom || imageUrl(img), sourceLoaded: imageOk(img) }
    return { map: t, aspect: w / h }
  }, [tex, phone])
}

// where the record sits and its turn. Upright: `pos` is its centre. Lying: `pos` is the middle of its
// near edge on the surface, and the far edge rises by `tilt` (a reading slope), so it never sinks in.
function Mount({ d, h, children }) {
  const lie = d.mount === 'lie'
  return (
    <group position={d.pos} rotation={[0, d.rotY || 0, 0]}>
      <group rotation={lie ? [-Math.PI / 2 + (d.tilt ?? 0.18), 0, 0] : [0, 0, 0]}>
        <group position={lie ? [0, h / 2, 0.012] : [0, 0, 0]}>{children}</group>
      </group>
    </group>
  )
}

// a wooden easel (owner feedback round 9: never a post): two front legs splayed from the floor to just
// above the record and leaning back behind it, a back leg, a ledge the record rests on and a crossbar
const WOOD = '#5a3b26'
function Leg({ a, b, r = 0.016 }) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const dir = B.clone().sub(A)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  return (
    <mesh position={A.clone().add(B).multiplyScalar(0.5).toArray()} quaternion={q}>
      <cylinderGeometry args={[r * 0.85, r, dir.length(), 8]} />
      <meshStandardMaterial color={WOOD} roughness={0.7} />
    </mesh>
  )
}
function Easel({ id, d, w, h }) {
  // it stands on the floor, or on the ground or stage the display names (display.floor, metres)
  const floor = d.floor || 0
  const ledge = d.pos[1] - h / 2 - floor
  if (d.mount !== 'stand' || ledge <= 0.05) return null
  const top = d.pos[1] + h / 2 + 0.1 - floor
  const spread = w / 2 + 0.12
  // a front leg at height y: its depth behind the record (z < 0), so the legs never cross the image
  const fz = (y) => 0.1 - (0.2 * y) / top
  const cross = Math.max(0.12, ledge - 0.4)
  const xAt = (y) => spread - ((spread - 0.05) * y) / top
  return (
    <group position={[d.pos[0], floor, d.pos[2]]} rotation={[0, d.rotY || 0, 0]} userData={{ easel: id }}>
      <Leg a={[-spread, 0, fz(0)]} b={[-0.05, top, fz(top)]} />
      <Leg a={[spread, 0, fz(0)]} b={[0.05, top, fz(top)]} />
      <Leg a={[0, 0, -0.55]} b={[0, top - 0.06, fz(top) - 0.02]} r={0.014} />
      {/* the ledge under the record */}
      <mesh position={[0, ledge - 0.014, 0.012]}>
        <boxGeometry args={[w + 0.14, 0.028, 0.075]} />
        <meshStandardMaterial color={WOOD} roughness={0.7} />
      </mesh>
      {/* a crossbar between the front legs */}
      <Leg a={[-xAt(cross), cross, fz(cross)]} b={[xAt(cross), cross, fz(cross)]} r={0.012} />
    </group>
  )
}

function Framed({ r, w, h, map, onPick, register }) {
  const ref = useRef()
  // dev only (e2e/chapters.mjs part records): the record this frame shows, drawn from its own file (a panel shows none)
  useRecordDraw(r.art ? r.id : null, r.art?.id, r.src, ref, r.src ? 'image' : 'card')
  useEffect(() => {
    register(r.id, ref.current)
    return () => register(r.id, null)
  }, [r.id, register])
  const border = Math.max(0.012, Math.min(w, h) * 0.05)
  return (
    <>
      <Mount d={r.display} h={h + border * 2}>
        <group
          onClick={(e) => {
            e.stopPropagation()
            if (e.delta <= 6) onPick?.(r.id)
          }}
        >
          <mesh position={[0, 0, -0.008]}>
            <boxGeometry args={[w + border * 2, h + border * 2, 0.014]} />
            <meshStandardMaterial color={r.display.mount === 'lie' ? MAT : FRAME} roughness={0.8} />
          </mesh>
          <mesh ref={ref} name={`record-${r.id}`} userData={{ record: r.art?.id || null, panel: r.panel ? r.id : null, mount: r.display.mount }}>
            <planeGeometry args={[w, h]} />
            {map ? <meshStandardMaterial key="map" map={map} roughness={0.85} emissiveMap={map} emissive="#ffffff" emissiveIntensity={0.25} /> : <meshStandardMaterial key="blank" color="#16120e" />}
          </mesh>
        </group>
      </Mount>
      <Easel id={r.id} d={r.display} w={w + border * 2} h={h + border * 2} />
    </>
  )
}

function ImageRecord({ r, phone, onPick, register }) {
  const { map, aspect } = useRoomImage(r.src, phone)
  const [w, h] = fitRecord(r.display.size, aspect)
  return <Framed r={r} w={w} h={h} map={map} onPick={onPick} register={register} />
}

// link-only: no image (rights unknown); a card naming the record and where to see it
function LinkCard({ r, onPick, register }) {
  const [w, h] = fitRecord(r.display.size, 1.4)
  const spec = useMemo(() => ({ w, h, eyebrow: 'Link only', title: r.art.title, lines: [{ text: 'View at the holder (the record card has the link)' }], scale: 1.4, columns: 1, fit: true }), [w, h, r.art.title])
  const map = useTextCard(spec)
  return <Framed r={r} w={w} h={h} map={map} onPick={onPick} register={register} />
}

// a labelled panel stop (roomRecords.js roomPanelOf): its title and its facts' verified text, each id beneath
const panelLines = (panel) => (panel.factIds || []).map((id) => ({ factId: id, text: INDEX.facts[id]?.claim })).filter((l) => l.text)
function PanelCard({ r, onPick, register }) {
  const [w, h] = r.display.size
  const spec = useMemo(() => ({ w, h, eyebrow: r.panel.eyebrow, title: r.panel.title, lines: panelLines(r.panel), scale: 3, columns: 1, fit: true }), [w, h, r.panel])
  const map = useTextCard(spec)
  return <Framed r={r} w={w} h={h} map={map} onPick={onPick} register={register} />
}

export function RoomRecords({ room, phone, onPick, onRecord }) {
  const records = useMemo(() => roomRecordStops(room).filter((r) => r.display && !r.problem), [room])
  const declared = useMemo(() => declaredRecordIds(room), [room])
  // dev only (e2e/chapters.mjs): the record meshes the room shows, by stop
  const meshes = useRef({})
  const register = useMemo(
    () => (id, m) => {
      if (m) meshes.current[id] = m
      else delete meshes.current[id]
      onRecord?.(id, m)
    },
    [onRecord],
  )
  useEffect(() => {
    if (!import.meta.env.DEV) return
    // declared: every stop the room's data says shows a record (roomRecords.js declaredRecordIds), drawn or not; the
    // e2e gates check each of these, not only the ones that survived to be drawn (Codex review 3)
    window.__roomRecords = () => ({ declared: declared.slice(), expected: records.map((r) => r.id), meshes: meshes.current })
    return () => {
      window.__roomRecords = null
    }
  }, [records, declared])
  return records.map((r) => (
    <StageSuspense key={r.id} what={`the record at stop ${r.id}`}>
      {r.panel ? <PanelCard r={r} onPick={onPick} register={register} /> : r.src ? <ImageRecord r={r} phone={phone} onPick={onPick} register={register} /> : <LinkCard r={r} onPick={onPick} register={register} />}
    </StageSuspense>
  ))
}

export default RoomRecords
