// A story point drawn as a small museum object: a framed thumbnail of the verified, rights-cleared
// media record linked to the point's fact, or, when there is none on file, a neutral object-type
// icon that says what kind of record backs the point. Nothing here is drawn to look like a real
// object that is not shown.

export const KIND_LABEL = {
  photograph: 'Photograph',
  document: 'Document',
  object: 'Object',
  record: 'Source record',
}

export function KindIcon({ kind }) {
  // 24 x 24 line icons, stroke only
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'photograph')
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="1" {...p} />
        <path d="M5.5 16.5l4.2-4.6 3 3.1 2.2-2.2 3.6 3.7" {...p} />
        <circle cx="15.8" cy="9" r="1.4" {...p} />
      </svg>
    )
  if (kind === 'document')
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 3.5h7.5l4 4v13h-11.5z" {...p} />
        <path d="M14 3.5v4h4M9 11h6M9 13.8h6M9 16.6h4" {...p} />
      </svg>
    )
  if (kind === 'object')
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7z" {...p} />
        <path d="M4.5 7.7L12 12l7.5-4.3M12 12v8.5" {...p} />
      </svg>
    )
  // record: an index card with a ruled line and a stamp ring (the source page the fact quotes)
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="13" rx="1.2" {...p} />
      <path d="M7 9.5h7M7 12.3h10M7 15.1h5" {...p} />
      <circle cx="16.3" cy="15.4" r="1.7" {...p} />
    </svg>
  )
}

// The framed object itself (thumbnail or icon), sized by CSS.
export function ObjectFrame({ point, large = false }) {
  const a = point.artifact
  const img = a?.media?.thumb
  return (
    <span className={`obj${large ? ' obj--lg' : ''}${img ? ' obj--img' : ' obj--icon'}${point.pending ? ' obj--pending' : ''}`}>
      <span className="obj-mat">
        {point.pending ? null : img ? (
          <img src={img} alt={large ? a.media.alt : ''} loading="lazy" decoding="async" />
        ) : (
          <KindIcon kind={a?.kind || 'record'} />
        )}
      </span>
    </span>
  )
}

// One line that says what the object is, for the label and the card.
export function objectCaption(point) {
  if (point.pending) return 'Pending verification'
  // a turning-point chapter: the year of its first verified fact, never an invented caption
  if (point.kind && point.year) return String(point.year)
  const a = point.artifact
  const kind = KIND_LABEL[a?.kind] || KIND_LABEL.record
  if (a?.media?.thumb) return kind
  if (a?.media) return `${kind} · not on display yet`
  return kind
}
