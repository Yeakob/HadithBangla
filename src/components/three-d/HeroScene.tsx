import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { dotTexture, floorTexture, pageTexture, rayTexture, skyTexture, woodTexture } from './textures'

interface Props { lite: boolean; still: boolean; active: boolean; onReady?: () => void }

/** Open book resting on a carved wooden rehal, inside an arched hall lit by late sunlight. */
export default function HeroScene({ lite, still, active, onReady }: Props) {
  return (
    <Canvas
      shadows={!lite}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      frameloop={!active ? 'never' : still ? 'demand' : 'always'}
      camera={{ fov: 30, position: [0, 2.5, 6.4], near: 0.1, far: 40 }}
      gl={{ antialias: !lite, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.25
        onReady?.()
      }}
      aria-hidden
    >
      <color attach="background" args={['#061a16']} />
      <fog attach="fog" args={['#061a16', 7, 17]} />
      <Lights lite={lite} />
      <Hall />
      <group position={[lite ? 0 : 1.4, 0, 0.5]} scale={lite ? 1.05 : 0.92}><Rehal /></group>
      {!lite && <Rays />}
      <Dust count={lite ? 120 : 380} still={still} />
      <CameraRig still={still} focusX={lite ? 0 : 1.15} lite={lite} />
    </Canvas>
  )
}

function Lights({ lite }: { lite: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  useEffect(() => {
    const s = sun.current
    if (!s) return
    s.target.position.set(0, 0.6, 0.4)
    s.target.updateMatrixWorld()
  }, [])
  return (
    <>
      <ambientLight intensity={0.42} color="#a9cbbd" />
      <hemisphereLight args={['#f6d9a8', '#062019', 0.35]} />
      <directionalLight
        ref={sun}
        position={[-2.6, 5.5, -5]}
        intensity={2.4}
        color="#ffd29a"
        castShadow={!lite}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
      />
      <pointLight position={[1.3, 2.3, 2.6]} intensity={9} distance={6} decay={1.6} color="#ffd9a0" />
      <spotLight position={[1.0, 3.6, 4.2]} angle={0.42} penumbra={0.8} intensity={22} distance={10} decay={1.4} color="#fff0d2" target-position={[1.35, 0.8, 1.0]} />
      <pointLight position={[-1.6, 0.9, 0.8]} intensity={1.4} distance={4} color="#1f7a62" />
    </>
  )
}

function archShape(x: number, w: number, base: number, rise: number, top: number) {
  const p = new THREE.Path()
  p.moveTo(x - w / 2, base)
  p.lineTo(x - w / 2, rise)
  p.quadraticCurveTo(x - w / 2, top - 0.15, x, top)
  p.quadraticCurveTo(x + w / 2, top - 0.15, x + w / 2, rise)
  p.lineTo(x + w / 2, base)
  p.lineTo(x - w / 2, base)
  return p
}

function Hall() {
  const floor = useMemo(() => floorTexture(), [])
  const sky = useMemo(() => skyTexture(), [])
  const wall = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-8, 0)
    s.lineTo(8, 0)
    s.lineTo(8, 14)
    s.lineTo(-8, 14)
    s.lineTo(-8, 0)
    ;[-2.6, 0.4, 3.4].forEach((x) => s.holes.push(archShape(x, 1.5, 0.45, 2.0, 3.0)))
    return new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 })
  }, [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial map={floor} roughness={0.55} metalness={0.1} color="#9bb3aa" />
      </mesh>
      <mesh geometry={wall} position={[0, 0, -4.4]} castShadow receiveShadow>
        <meshStandardMaterial color="#0c3a31" roughness={0.85} />
      </mesh>
      {/* gold hairline trims on the arches */}
      {[-2.6, 0.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 3.22, -3.86]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color="#c8a45d" metalness={0.9} roughness={0.25} emissive="#5a4310" />
        </mesh>
      ))}
      <mesh position={[0, 5, -5.4]}>
        <planeGeometry args={[22, 16]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Board of the rehal; the X is seen from the front, the book opens across the two upper arms. */
function Board({ angle, map }: { angle: number; map: THREE.Texture }) {
  return (
    <mesh rotation-z={angle} castShadow receiveShadow>
      <boxGeometry args={[1.62, 0.05, 0.92]} />
      <meshStandardMaterial map={map} roughness={0.55} metalness={0.05} color="#c08a5a" />
    </mesh>
  )
}

function curvedPage(w: number, h: number, spineAtRight: boolean) {
  const g = new THREE.PlaneGeometry(w, h, 32, 1)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + w / 2) / w // 0 at left edge, 1 at right edge
    const fromSpine = spineAtRight ? 1 - u : u
    // pages rise from the spine, bulge, and settle toward the fore-edge
    pos.setZ(i, Math.sin(Math.PI * Math.min(1, fromSpine * 1.1)) * 0.05 + (1 - fromSpine) * 0.03)
  }
  g.computeVertexNormals()
  return g
}

function usePageTextures() {
  const [pages, setPages] = useState<[THREE.Texture, THREE.Texture] | null>(null)
  useEffect(() => {
    let alive = true
    const make = () => { if (alive) setPages([pageTexture('left'), pageTexture('right')]) }
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.load) Promise.race([fonts.load('700 150px Amiri'), new Promise((r) => setTimeout(r, 2500))]).then(make, make)
    else make()
    return () => { alive = false }
  }, [])
  return pages
}

/** One half of the open book, laid along one upper arm of the rehal. */
function BookHalf({ side, angle, map }: { side: 'left' | 'right'; angle: number; map?: THREE.Texture }) {
  const s = side === 'left' ? -1 : 1
  const geo = useMemo(() => curvedPage(0.74, 0.98, side === 'left'), [side])
  return (
    <group rotation-z={s * angle}>
      <mesh position={[s * 0.42, 0.04, 0]} castShadow>
        <boxGeometry args={[0.8, 0.02, 1.06]} />
        <meshStandardMaterial color="#0d4a3c" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[s * 0.41, 0.064, 0]} castShadow>
        <boxGeometry args={[0.74, 0.03, 0.98]} />
        <meshStandardMaterial color="#efe2c2" roughness={0.9} />
      </mesh>
      {/* keyed so a fresh material is built once the page artwork is ready (three.js won't add a map later) */}
      <mesh key={map ? 'art' : 'plain'} geometry={geo} position={[s * 0.41, 0.081, 0]} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial map={map} color={map ? '#ffffff' : '#efe2c2'} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Rehal() {
  const wood = useMemo(() => woodTexture(), [])
  const pages = usePageTextures()
  const A = 0.42 // each upper arm rises by A radians; the book opens across them
  return (
    <group position={[0, 0.48, 0.35]} rotation-x={0.5}>
      <Board angle={A} map={wood} />
      <Board angle={-A} map={wood} />
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.035, 0.035, 1.0, 16]} />
        <meshStandardMaterial color="#c8a45d" metalness={0.9} roughness={0.3} />
      </mesh>
      <BookHalf side="left" angle={A} map={pages?.[0]} />
      <BookHalf side="right" angle={A} map={pages?.[1]} />
      <mesh position={[0.02, 0.1, 0.5]} rotation-x={0.3}>
        <boxGeometry args={[0.03, 0.004, 0.24]} />
        <meshStandardMaterial color="#9c2f2f" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Rays() {
  const t = useMemo(() => rayTexture(), [])
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  useFrame(({ clock }) => {
    mats.current.forEach((m, i) => {
      m.opacity = 0.22 + Math.sin(clock.elapsedTime * 0.35 + i * 1.7) * 0.06
    })
  })
  const beams: [number, number, number, number][] = [
    [-1.9, 1.9, -2.2, 0.3],
    [0.9, 1.9, -2.0, 0.22],
  ]
  return (
    <group>
      {beams.map(([x, y, z, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-0.55, 0, rz]}>
          <planeGeometry args={[1.25, 6.2]} />
          <meshBasicMaterial
            ref={(m) => { if (m) mats.current[i] = m }}
            map={t}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.24}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function Dust({ count, still }: { count: number; still: boolean }) {
  const sprite = useMemo(() => dotTexture(), [])
  const ref = useRef<THREE.Points>(null)
  const seeds = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [count])
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 6
      p[i * 3 + 1] = Math.random() * 4.2 + 0.2
      p[i * 3 + 2] = Math.random() * -4 + 1.2
    }
    return p
  }, [count])
  useFrame((_, dt) => {
    if (still || !ref.current) return
    const a = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + dt * (0.04 + seeds[i] * 0.06)
      if (y > 4.5) y = 0.2
      a.setY(i, y)
      a.setX(i, a.getX(i) + Math.sin(y * 2 + seeds[i] * 10) * dt * 0.05)
    }
    a.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={sprite} size={0.035} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} color="#ffe2a8" opacity={0.8} />
    </points>
  )
}

function CameraRig({ still, focusX, lite }: { still: boolean; focusX: number; lite: boolean }) {
  const { camera, pointer, invalidate } = useThree()
  // on phones the text sits below the scene, so aim a little lower to keep the book in the top half
  const look = useMemo(() => new THREE.Vector3(focusX, lite ? 0.55 : 0.95, lite ? 0.6 : 0.3), [focusX, lite])
  // place the camera at its resting framing before the first frame, so slow devices never show a wrong view
  useLayoutEffect(() => {
    camera.position.set(focusX * 0.35, lite ? 3.3 : 2.3, lite ? 5.0 : 6.2)
    camera.lookAt(look)
    camera.updateMatrixWorld()
    invalidate()
  }, [camera, focusX, lite, look, invalidate])
  useFrame(({ clock }) => {
    if (still) return
    const t = clock.elapsedTime
    camera.position.x += (focusX * 0.35 + Math.sin(t * 0.12) * 0.3 + pointer.x * 0.4 - camera.position.x) * 0.03
    camera.position.y += ((lite ? 3.3 : 2.3) + Math.sin(t * 0.09) * 0.06 + pointer.y * 0.18 - camera.position.y) * 0.03
    camera.lookAt(look)
  })
  return null
}
