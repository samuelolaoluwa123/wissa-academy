'use client'
import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line, Sparkles } from '@react-three/drei'

/* Four nodes = four courses. Colors match the app's existing pill colors
   (blue/green/amber/purple) so the hero ties directly into the brand system
   used everywhere else in the product. */
const NODES = [
  { color: '#4a9eff', pos: [2.3, 1.05, 0.1] },   // HTML/CSS/JS
  { color: '#3ee87a', pos: [-2.25, 0.95, 0.5] }, // Data Science
  { color: '#f5a623', pos: [1.85, -1.3, -0.4] }, // AI Content Creation
  { color: '#8c64ff', pos: [-1.9, -1.15, 0.15] },// No-Code Design
]

function CoreNode() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.22
    ref.current.rotation.x += delta * 0.07
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#4a9eff" wireframe emissive="#4a9eff" emissiveIntensity={0.45} />
    </mesh>
  )
}

function OrbitNode({ color, pos }) {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.5
    ref.current.rotation.x += delta * 0.3
  })
  return (
    <Float speed={1.3} rotationIntensity={0.35} floatIntensity={1.1}>
      <group position={pos}>
        <mesh ref={ref}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} />
        </mesh>
      </group>
    </Float>
  )
}

function ConnectorLines() {
  return NODES.map((n, i) => (
    <Line key={i} points={[[0, 0, 0], n.pos]} color={n.color} transparent opacity={0.32} lineWidth={1} />
  ))
}

function Scene() {
  const group = useRef()
  useFrame((state) => {
    // gentle parallax toward the pointer — damped, never snaps
    const targetY = state.pointer.x * 0.28
    const targetX = -state.pointer.y * 0.18
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04
  })
  return (
    <group ref={group}>
      <CoreNode />
      <ConnectorLines />
      {NODES.map((n, i) => <OrbitNode key={i} color={n.color} pos={n.pos} />)}
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 3, 4]} intensity={1.1} />
      <directionalLight position={[-3, -2, -3]} intensity={0.3} color="#8c64ff" />
      <Sparkles count={70} scale={7} size={2} speed={0.22} color="#4a9eff" opacity={0.45} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}