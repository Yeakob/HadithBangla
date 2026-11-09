import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** Gold eight-point star (Rub el Hizb form) that turns slowly. Decorative. */
function Star({ still }: { still: boolean }) {
  const g = useRef<THREE.Group>(null)
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI / 8) * i - Math.PI / 2
      const r = i % 2 === 0 ? 1 : 0.76
      const x = Math.cos(a) * r, y = Math.sin(a) * r
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    }
    s.closePath()
    const hole = new THREE.Path()
    hole.absarc(0, 0, 0.32, 0, Math.PI * 2, true)
    s.holes.push(hole)
    return new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3 })
  }, [])
  useFrame(({ clock, pointer }) => {
    if (!g.current) return
    const t = still ? 0.6 : clock.elapsedTime
    g.current.rotation.y = Math.sin(t * 0.4) * 0.6 + pointer.x * 0.4
    g.current.rotation.x = Math.cos(t * 0.3) * 0.25 - pointer.y * 0.3
    g.current.rotation.z = t * 0.08
  })
  return (
    <group ref={g}>
      <mesh geometry={geo} position={[0, 0, -0.08]}>
        <meshStandardMaterial color="#c8a45d" metalness={0.92} roughness={0.28} />
      </mesh>
      <mesh geometry={geo} rotation-z={Math.PI / 8} position={[0, 0, -0.2]} scale={0.62}>
        <meshStandardMaterial color="#0d5a49" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function GeoStar({ still, active }: { still: boolean; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={!active ? 'never' : still ? 'demand' : 'always'}
      camera={{ position: [0, 0, 3.6], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} color="#fff1d0" />
      <pointLight position={[-3, -1, 2]} intensity={6} color="#3fb491" />
      <Star still={still} />
    </Canvas>
  )
}
