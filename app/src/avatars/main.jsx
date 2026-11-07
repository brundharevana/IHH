// Entry for avatars.html (guide candidate comparison). Query params:
//   ?t=<seconds>     freeze the shared timeline at that moment (screenshots)
//   ?view=all|a|b|c  camera framing; ?face=1 head-and-shoulders on the chosen candidate
//   ?autoplay=1      start the sequence without a click (audio may stay muted)
import { createRoot } from 'react-dom/client'
import '../design/tokens.css'
import './avatars.css'
import { AvatarsPage } from './AvatarsPage.jsx'

const q = new URLSearchParams(window.location.search)
const t = q.get('t')

createRoot(document.getElementById('avatars-root')).render(
  <AvatarsPage
    fixedT={t !== null && !Number.isNaN(Number(t)) ? Number(t) : null}
    view={['all', 'a', 'b', 'c'].includes(q.get('view')) ? q.get('view') : 'all'}
    face={q.get('face') === '1'}
    autoplay={q.get('autoplay') === '1'}
  />,
)
