// Inside the canvas: keeps the label layer's projection camera current (labels.jsx draws the DOM
// side). Separate from labels.jsx so the layer itself needs no react-three-fiber.
import { useFrame, useThree } from '@react-three/fiber'
import { view } from './labels.jsx'

export function LabelCamera() {
  const { camera, size } = useThree()
  useFrame(() => {
    view.camera = camera
    view.width = size.width
    view.height = size.height
  })
  return null
}
