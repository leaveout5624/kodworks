import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (
        el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.closest('button') ||
        el.closest('a') ||
        el.dataset.hover === 'true'
      ) {
        isHovering.current = true
      }
    }
    const onOut = () => {
      isHovering.current = false
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    let raf: number
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15
      pos.current.y += (target.current.y - pos.current.y) * 0.15

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
      }
      if (ringRef.current) {
        const scale = isHovering.current ? 2.5 : 1
        ringRef.current.style.transform = `translate(${pos.current.x - 16}px, ${pos.current.y - 16}px) scale(${scale})`
        ringRef.current.style.opacity = isHovering.current ? '1' : '0.5'
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999]"
        style={{ backgroundColor: '#cd7f32' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] border transition-opacity duration-200"
        style={{ borderColor: '#cd7f32', opacity: 0.5 }}
      />
    </>
  )
}
