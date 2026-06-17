import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Grid3X3, TrendingUp, Brain } from 'lucide-react'

// ── Voxel Grid System ────────────────────────────────────────────
function GridSystem({ scrollProgress }: { scrollProgress: number }) {
  const gridSize = 40
  const spacing = 0.5
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const mouse = useRef(new THREE.Vector2(0, 0))
  const raycaster = useRef(new THREE.Raycaster())
  const hitPointCache = useRef(new THREE.Vector3(999, 999, 999))

  const boxes = useMemo(() => {
    const items: Array<{
      position: [number, number, number]
      args: [number, number, number]
      phase: number
      id: string
    }> = []
    const center = (gridSize * spacing) / 2 - spacing / 2
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const posX = x * spacing - center
        const posY = y * spacing - center
        const baseDepth = 0.1
        items.push({
          position: [posX, posY, 0],
          args: [0.4, 0.4, baseDepth],
          phase: (x + y) * 0.2,
          id: `box-${x}-${y}`,
        })
      }
    }
    return items
  }, [])

  const handlePointerMove = useCallback((e: { nativeEvent: { clientX: number; clientY: number } }) => {
    mouse.current.x = (e.nativeEvent.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = -(e.nativeEvent.clientY / window.innerHeight) * 2 + 1
  }, [])

  useFrame(({ camera }) => {
    raycaster.current.setFromCamera(mouse.current, camera)
    const meshes = meshRefs.current.filter(Boolean) as THREE.Mesh[]
    const intersects = raycaster.current.intersectObjects(meshes, false)
    const hitPoint =
      intersects.length > 0 ? intersects[0].point : new THREE.Vector3(999, 999, 999)
    hitPointCache.current = hitPoint

    for (let i = 0; i < meshRefs.current.length; i++) {
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      const phase = boxes[i].phase
      const dist = hitPoint.distanceTo(mesh.position)
      const influence = Math.max(0, 1 - dist / 5)
      const scrollWave = Math.sin(scrollProgress * Math.PI * 2 + phase) * 0.5
      const mouseLift = influence * 2
      const targetZ = scrollWave + mouseLift
      const targetScale = 1 + Math.abs(scrollWave) * 0.5 + influence * 1.5

      mesh.position.z += (targetZ - mesh.position.z) * 0.1
      const s = mesh.scale.x + (targetScale - mesh.scale.x) * 0.1
      mesh.scale.set(s, s, s)

      const mat = mesh.material as THREE.MeshStandardMaterial
      if (influence > 0.1) {
        mat.emissive.setHex(0xcd7f32)
        mat.emissiveIntensity = influence * 0.8
      } else {
        mat.emissiveIntensity = 0
      }
    }
  })

  return (
    <Canvas
      onPointerMove={handlePointerMove}
      camera={{ position: [0, -5, 8], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#cd7f32" />
      <group>
        <meshStandardMaterial
          attach="material"
          color="#1a1a1a"
          roughness={0.6}
          metalness={0.2}
        />
        {boxes.map((box, i) => (
          <mesh
            key={box.id}
            position={box.position}
            ref={(el) => { meshRefs.current[i] = el }}
          >
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.6}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>
    </Canvas>
  )
}

// ── Algorithm Card ───────────────────────────────────────────────
interface AlgoCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  delay: number
}

function AlgoCard({ icon, title, description, features, delay }: AlgoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      className="group relative bg-[#0e0e10] border border-white/5 p-8 hover:border-[#cd7f32]/30 transition-all duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#cd7f32]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="w-12 h-12 flex items-center justify-center bg-[#cd7f32]/10 border border-[#cd7f32]/20 mb-6 group-hover:shadow-bronze transition-shadow duration-500">
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-sm text-[#b0b0b0] leading-relaxed mb-6">{description}</p>

        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-[#b0b0b0]">
              <div className="w-1 h-1 rounded-full bg-[#cd7f32]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Algorithms Section ───────────────────────────────────────────
export function AlgorithmsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollProgress = 0.3 // Could be driven by scroll observer

  const algorithms = [
    {
      icon: <Grid3X3 className="w-6 h-6 text-[#cd7f32]" />,
      title: 'GRID BOT',
      description:
        'Capitalizes on ranging markets by placing a mesh of buy and sell orders at predefined intervals, capturing profits from price oscillations without predicting direction.',
      features: [
        'Adaptive grid spacing',
        'Dynamic range detection',
        'Auto-rebalancing',
        'Profit compounding',
      ],
      delay: 0,
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#cd7f32]" />,
      title: 'MARTINGALE',
      description:
        'Adaptive recovery systems that scale positions to optimize entry averages. Designed to recover from drawdowns through intelligent position sizing algorithms.',
      features: [
        'Smart position scaling',
        'Risk-adjusted multipliers',
        'Maximum drawdown protection',
        'Automatic take-profit levels',
      ],
      delay: 150,
    },
    {
      icon: <Brain className="w-6 h-6 text-[#cd7f32]" />,
      title: 'AI SIGNALS',
      description:
        'Machine learning aggregators scanning cross-exchange order book imbalances, social sentiment, and technical indicators to generate high-probability trade signals.',
      features: [
        'Multi-source data fusion',
        'Real-time sentiment analysis',
        'Pattern recognition engine',
        'Confidence scoring system',
      ],
      delay: 300,
    },
  ]

  return (
    <section
      id="algorithms"
      ref={sectionRef}
      className="relative min-h-screen bg-[#0e0e10] py-24 overflow-hidden"
    >
      {/* Voxel Grid Background */}
      <div className="absolute inset-0 opacity-30 z-0">
        <GridSystem scrollProgress={scrollProgress} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] text-[#cd7f32] mb-4 block">
            ALGORITHMIC LOGIC
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Three Pillars of{' '}
            <span className="text-gradient-bronze">Execution</span>
          </h2>
          <p className="text-[#b0b0b0] max-w-2xl mx-auto">
            Our strategies are built on proven quantitative models, refined through
            millions of backtested scenarios across volatile market conditions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {algorithms.map((algo) => (
            <AlgoCard key={algo.title} {...algo} />
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '< 0.4s', label: 'Avg Execution Latency' },
            { value: '99.9%', label: 'Platform Uptime' },
            { value: '150%+', label: 'Backtested Annual ROI' },
            { value: '24/7', label: 'Automated Operation' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-[#0a0a0a] border border-white/5"
            >
              <div className="text-3xl font-black text-[#cd7f32] mb-2">{stat.value}</div>
              <div className="text-xs text-[#b0b0b0] tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
