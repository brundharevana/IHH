import Landing from './landing/Landing.jsx'
import { startTourDefault } from './landing/tourHook.js'

// The landing owns this page. The tour plugs in through onStartTour (see landing/tourHook.js).
export default function App() {
  return <Landing onStartTour={startTourDefault} />
}
