import { useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { ArrowRight, Play, TrendingUp, Activity } from 'lucide-react'

// ── Spatial Number Scene ─────────────────────────────────────────
interface NumberConfig {
  number: number
  type: string
}

interface TextureEntry {
  number: number
  isWin: boolean
  texture: THREE.CanvasTexture
}

function createNumberTexture(number: number, isWin: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.beginPath()
  ctx.roundRect(20, 20, 472, 472, 40)
  ctx.fill()

  ctx.font = 'bold 300px "Inter", sans-serif'
  ctx.textAlign = 'center'

  if (isWin) {
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#cd7f32'
    ctx.shadowBlur = 40
    ctx.fillText(String(number), 256, 340)
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#b0b0b0'
    ctx.font = 'bold 80px "Inter", sans-serif'
    ctx.fillText('WIN', 256, 420)
  } else {
    ctx.fillStyle = '#b0b0b0'
    ctx.shadowColor = '#0e0e10'
    ctx.shadowBlur = 20
    ctx.fillText(String(number), 256, 340)
  }

  return new THREE.CanvasTexture(canvas)
}

function SpatialNumberScene() {
  const portalMeshRefs = useRef<THREE.Mesh[]>([])
  const initialYRef = useRef<number[]>([])
  const isWinningRef = useRef<boolean[]>(new Array(10).fill(false))

  const numberConfigs: NumberConfig[] = useMemo(
    () => [
      { number: 7, type: 'jackpot' },
      { number: 3, type: 'normal' },
      { number: 0, type: 'normal' },
      { number: 9, type: 'normal' },
      { number: 4, type: 'normal' },
      { number: 1, type: 'normal' },
      { number: 2, type: 'normal' },
      { number: 8, type: 'normal' },
      { number: 6, type: 'normal' },
      { number: 5, type: 'normal' },
    ],
    []
  )

  const numberTextures: TextureEntry[] = useMemo(() => {
    const textures: TextureEntry[] = []
    for (const config of numberConfigs) {
      textures.push({ number: config.number, isWin: false, texture: createNumberTexture(config.number, false) })
      textures.push({ number: config.number, isWin: true, texture: createNumberTexture(config.number, true) })
    }
    return textures
  }, [numberConfigs])

  const bronzeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cd7f32', metalness: 1.0, roughness: 0.2 }), [])
  const voidMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e0e10', metalness: 0.8, roughness: 0.4 }), [])

  const scene = useMemo(() => {
    const s = new THREE.Scene()
    s.fog = new THREE.FogExp2(0x0e0e10, 0.02)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    s.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffaa00, 20, 20)
    pointLight.position.set(2, 5, 4)
    s.add(pointLight)

    const backLight = new THREE.DirectionalLight(0xcd7f32, 2.5)
    backLight.position.set(-5, 2, -5)
    s.add(backLight)

    const geo = new THREE.PlaneGeometry(3.5, 5)
    const initialY: number[] = []
    const positions = [
      [-6, 0, -5],
      [-3.5, 2, -8],
      [-1, -1, -12],
      [1.5, 1.5, -15],
      [4, -0.5, -10],
      [6.5, 2.5, -7],
      [-7, 3, -14],
      [8, -2, -11],
      [-4.5, -3, -9],
      [3, 3.5, -13],
    ]

    for (let i = 0; i < numberConfigs.length; i++) {
      const yPos = Math.random() * 3 - 1
      initialY.push(yPos)

      const group = new THREE.Group()
      group.position.set(positions[i][0], yPos, positions[i][2])

      const portal = new THREE.Mesh(geo, bronzeMaterial.clone())
      group.add(portal)
      s.add(group)

      const textMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0.8,
        transparent: true,
        opacity: 0.9,
        map: numberTextures.find((t) => t.number === numberConfigs[i].number && !t.isWin)?.texture,
      })
      const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), textMaterial)
      textPlane.position.z = 0.1
      portal.add(textPlane)
      portal.userData.textMaterial = textMaterial

      portalMeshRefs.current.push(portal)
    }

    initialYRef.current = initialY
    return s
  }, [numberConfigs, numberTextures, bronzeMaterial])

  // Random win state toggling
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * 10)
      isWinningRef.current[idx] = !isWinningRef.current[idx]
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Orbit lights
    const pointLight = scene.children.find((c) => c instanceof THREE.PointLight) as THREE.PointLight
    if (pointLight) {
      pointLight.position.x = Math.sin(time * 0.5) * 8
      pointLight.position.z = Math.cos(time * 0.5) * 8
    }

    // Animate portals
    for (let i = 0; i < portalMeshRefs.current.length; i++) {
      const mesh = portalMeshRefs.current[i]
      if (!mesh) continue

      mesh.position.y = Math.sin(time * 0.5 + i) * 0.2
      mesh.rotation.y = Math.sin(time * 0.2 + i) * 0.1

      const textMat = mesh.userData.textMaterial as THREE.MeshStandardMaterial

      if (isWinningRef.current[i]) {
        const scale = 1 + Math.sin(time * 10) * 0.05
        mesh.scale.set(scale, scale, scale)
        mesh.material = voidMaterial
        const winTex = numberTextures.find(
          (t) => t.number === numberConfigs[i].number && t.isWin
        )
        if (winTex && textMat) {
          textMat.map = winTex.texture
          textMat.emissive = new THREE.Color('#cd7f32')
          textMat.emissiveIntensity = 0.5
        }
      } else {
        mesh.scale.set(1, 1, 1)
        mesh.material = bronzeMaterial
        const loseTex = numberTextures.find(
          (t) => t.number === numberConfigs[i].number && !t.isWin
        )
        if (loseTex && textMat) {
          textMat.map = loseTex.texture
          textMat.emissiveIntensity = 0
        }
      }
    }

    scene.rotation.y = Math.sin(time * 0.1) * 0.05
    scene.rotation.x = Math.cos(time * 0.15) * 0.02
  })

  return (
    <>
      <primitive object={scene} />
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.8} />
      </EffectComposer>
    </>
  )
}

// ── Ticker Bar ───────────────────────────────────────────────────
function TickerBar() {
  const tickers = [
    { symbol: 'BTCUSDT', type: 'Grid Bot', status: 'Active', change: '+2.4%' },
    { symbol: 'ETHUSDT', type: 'Martingale', status: 'Running', change: '+1.8%' },
    { symbol: 'R_100', type: 'AI Signal', status: 'Scanning', change: '+0.6%' },
    { symbol: 'BOOM 1000', type: 'Grid Bot', status: 'Active', change: '+3.1%' },
    { symbol: 'CRASH 1000', type: 'Martingale', status: 'Running', change: '+1.2%' },
  ]

  return (
    <div className="absolute bottom-8 left-4 right-4 z-20">
      <div className="bg-glass max-w-5xl mx-auto px-6 py-4 flex items-center gap-6 overflow-x-auto scrollbar-thin">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="flex items-center gap-3 min-w-fit">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d084]" />
              <span className="text-sm font-semibold text-white">{ticker.symbol}</span>
            </div>
            <span className="text-xs text-[#b0b0b0]">{ticker.type}</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#00d084]" />
              <span className="text-xs text-[#00d084]">{ticker.status}</span>
            </div>
            <span className="text-xs text-[#00d084]">{ticker.change}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hero Section ─────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          style={{ background: '#0e0e10' }}
          gl={{ antialias: true, alpha: false }}
        >
          <SpatialNumberScene />
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(14,14,16,0.95) 0%, rgba(14,14,16,0.6) 40%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-4xl">
        <div className="mb-4">
          <span className="text-xs tracking-[0.3em] text-[#00d084] font-medium">
            QUANTITATIVE TRADING INFRASTRUCTURE
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Grid Bots,{' '}
          <span className="text-gradient-bronze">Martingale</span>{' '}
          <span className="text-[#cd7f32]">&</span> AI Signals.
          <br />
          Deployed in{' '}
          <span className="relative">
            Seconds
            <span
              className="absolute bottom-1 left-0 h-[3px] bg-[#cd7f32]"
              style={{ width: '100%' }}
            />
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#b0b0b0] max-w-xl mb-8 leading-relaxed">
          Zero-coding algorithmic execution for crypto and forex markets.
          Build, backtest, and deploy trading strategies with institutional-grade precision.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-black bg-[#cd7f32] hover:bg-[#e8c07e] transition-all duration-300 animate-pulse-bronze"
            style={{ borderRadius: '50px' }}
          >
            INITIALIZE BOT
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/bots"
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white border border-white/20 hover:border-[#cd7f32] hover:text-[#cd7f32] transition-all duration-300"
            style={{ borderRadius: '50px' }}
          >
            <Play className="w-4 h-4" />
            VIEW STRATEGIES
          </Link>
        </div>
      </div>

      {/* Ticker Bar */}
      <TickerBar />

      {/* Scroll Indicator */}
      <div className="absolute bottom-32 right-8 z-20 hidden lg:flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] text-[#b0b0b0] rotate-90 origin-center translate-y-8">
          SCROLL
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-[#cd7f32] to-transparent" />
      </div>
    </section>
  )
}
