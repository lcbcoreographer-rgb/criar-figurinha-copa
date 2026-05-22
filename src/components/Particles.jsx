import { useEffect, useRef } from 'react'

export default function Particles({ count = 35, color = '#00FF87' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.6 + 0.3,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const now = Date.now() / 1000

      particles.forEach(p => {
        p.y -= p.speed
        p.x += p.drift
        p.pulse += 0.03
        const op = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))

        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }

        ctx.save()
        ctx.globalAlpha = op
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count, color])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  )
}
