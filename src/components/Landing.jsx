import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { CARD_STYLES, drawMiniCard } from '../lib/cardGenerator'

/* ── floating card previews ── */
const FLOAT_CARDS = [
  { style: 'fut',       x: '-9%',  y: '8%',   rot: -14, delay: 0,    scale: 0.88 },
  { style: 'neon',      x: '76%',  y: '6%',   rot: 11,  delay: 0.15, scale: 0.82 },
  { style: 'legendary', x: '-13%', y: '52%',  rot: -9,  delay: 0.3,  scale: 0.76 },
  { style: 'panini',    x: '78%',  y: '54%',  rot: 13,  delay: 0.45, scale: 0.80 },
  { style: 'retro',     x: '42%',  y: '78%',  rot: -5,  delay: 0.6,  scale: 0.68 },
]

const FAKE_NAMES    = ['MARCOS', 'ANA LUÍSA', 'GABRIEL', 'FERNANDA', 'PEDRO', 'JÉSSICA', 'CAIO', 'RAFAELA']
const FAKE_COUNTRIES = ['Brasil', 'Argentina', 'Portugal', 'Espanha']

/* ─────────────────── helpers ─────────────────── */
function MiniCard({ styleId, size = 100 }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    const c = ref.current
    c.width = size; c.height = Math.round(size * 1.4)
    drawMiniCard(c, styleId)
  }, [styleId, size])
  return <canvas ref={ref} style={{ width: size, height: Math.round(size * 1.4) }} className="rounded-xl" />
}

function FloatCard({ card }) {
  const accent = CARD_STYLES[card.style]?.accent || '#00FF87'
  return (
    <motion.div className="absolute select-none pointer-events-none"
      style={{ left: card.x, top: card.y }}
      initial={{ opacity: 0, scale: 0, rotate: card.rot }}
      animate={{ opacity: 0.8, scale: card.scale, rotate: card.rot }}
      transition={{ delay: card.delay + 0.9, duration: 0.7, type: 'spring' }}
    >
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 4.5 + card.delay * 0.6, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
        style={{ filter: `drop-shadow(0 0 20px ${accent}77)` }}
      >
        <MiniCard styleId={card.style} size={100} />
      </motion.div>
    </motion.div>
  )
}

function LiveFeed() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const add = () => {
      const name    = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
      const country = FAKE_COUNTRIES[Math.floor(Math.random() * FAKE_COUNTRIES.length)]
      setItems(prev => [{ id: Date.now(), name, country }, ...prev.slice(0, 4)])
    }
    add()
    const id = setInterval(add, 3200)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-xs">
      {items.map((it, i) => (
        <motion.div key={it.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1 - i * 0.18, x: 0 }}
          className="flex items-center gap-2 text-xs text-white/50 font-raj">
          <span className="w-1.5 h-1.5 rounded-full bg-ng shrink-0" />
          <span className="font-semibold text-white/70">{it.name}</span>
          <span>encomendou —</span>
          <span>{it.country}</span>
        </motion.div>
      ))}
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(8342)
  useEffect(() => {
    const id = setInterval(() => setCount(c => c + Math.floor(Math.random() * 3) + 1), 2800)
    return () => clearInterval(id)
  }, [])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
      className="flex items-center gap-2 text-sm text-white/50 font-raj">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ng opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-ng" />
      </span>
      <span><b className="text-ng">{count.toLocaleString('pt-BR')}</b> figurinhas encomendadas</span>
    </motion.div>
  )
}

/* ─────────────── decoração copa ─────────────── */

// Bola de futebol pulsando
function SoccerBall({ style: css, delay = 0, size = 40 }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ ...css, fontSize: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'block' }}
      >⚽</motion.span>
    </motion.div>
  )
}

// Estrelas douradas flutuando
function FloatingStar({ style: css, delay = 0, size = 22 }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ ...css, fontSize: size, color: '#FFD700' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0, 1, 0.7, 1], y: [20, 0, -8, 0] }}
      transition={{ delay, duration: 3, repeat: Infinity, repeatType: 'reverse' }}
    >★</motion.div>
  )
}

// Troféu animado
function Trophy({ style: css, delay = 0 }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-5xl"
      style={css}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.9, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 120 }}
    >
      <motion.span
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'block', filter: 'drop-shadow(0 0 14px #FFD70099)' }}
      >🏆</motion.span>
    </motion.div>
  )
}

// Bandeira do Brasil decorativa
function BRFlag({ style: css, delay = 0 }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-4xl"
      style={css}
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 0.85, rotate: [-10, 10, -10] }}
      transition={{ delay, duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >🇧🇷</motion.div>
  )
}

// Faixas diagonais verde/amarelo no fundo
function StadiumStripes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Faixas diagonais sutis */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${i * 20 - 10}%`,
            top: 0,
            width: '8%',
            height: '120%',
            background: i % 2 === 0
              ? 'linear-gradient(180deg, rgba(0,156,59,0.04) 0%, rgba(0,156,59,0.01) 100%)'
              : 'linear-gradient(180deg, rgba(255,223,0,0.03) 0%, rgba(255,223,0,0.01) 100%)',
            transform: 'skewX(-15deg)',
            transformOrigin: 'top left',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  )
}

// Arco de luz de estádio
function StadiumLight({ left, top, color, delay = 0 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left, top,
        width: 400,
        height: 400,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(2px)',
      }}
      animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
      transition={{ duration: 3 + delay, repeat: Infinity, delay }}
    />
  )
}

// Ticker verde-amarelo no topo
function CopaTicker() {
  const items = ['⚽ COPA DO MUNDO 2026', '🏆 USA · CANADA · MÉXICO', '🇧🇷 RUMO AO HEXA', '⭐ CRIE SUA FIGURINHA', '🎴 EDIÇÃO LIMITADA', '🔥 SEJA UM CRAQUE']
  const repeated = [...items, ...items, ...items]
  return (
    <div className="fixed top-0 inset-x-0 z-40 overflow-hidden" style={{ height: 28 }}>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, #009C3B, #00b843 50%, #009C3B)' }}
      />
      <motion.div
        className="flex items-center h-full gap-8 whitespace-nowrap absolute"
        animate={{ x: [0, -1400] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {repeated.map((t, i) => (
          <span key={i} className="font-raj font-black text-xs tracking-widest text-white/90 shrink-0">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// Bandeira Brasil grande ao fundo
function BgFlag() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 1.3 }}
        animate={{ opacity: 0.035, scale: 1 }}
        transition={{ duration: 2 }}
        className="font-bebas text-white select-none"
        style={{ fontSize: 'clamp(200px, 40vw, 500px)', lineHeight: 1, userSelect: 'none' }}
      >
        🇧🇷
      </motion.div>
    </div>
  )
}

/* ─────────────── main component ─────────────── */
export default function Landing({ goNext }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  const handleMouse = (e) => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2
    mouseX.set((e.clientX - cx) / cx * 8)
    mouseY.set((e.clientY - cy) / cy * 8)
  }

  return (
    <div
      className="screen-base relative overflow-hidden"
      onMouseMove={handleMouse}
      style={{ background: '#050a05', paddingTop: 40 }}
    >
      {/* ── VÍDEO DE FUNDO ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'cover', opacity: 0.22, zIndex: 0 }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradiente sobre o vídeo — mantém legibilidade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(5,10,5,0.45) 0%, rgba(5,10,5,0.82) 100%),
            linear-gradient(180deg, rgba(5,10,5,0.6) 0%, transparent 30%, transparent 70%, rgba(5,10,5,0.9) 100%)
          `,
        }}
      />

      {/* Overlay de cor verde/amarelo suave */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(0,156,59,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 50%, rgba(255,223,0,0.07) 0%, transparent 55%)
          `,
        }}
      />
      {/* Todos os decorativos ficam acima do vídeo (z-index 2+) */}

      {/* Ticker no topo */}
      <div style={{ position: 'relative', zIndex: 10 }}><CopaTicker /></div>

      {/* Fundo: bandeira BR gigante */}
      <div style={{ zIndex: 2 }}><BgFlag /></div>

      {/* Faixas de estádio */}
      <div style={{ zIndex: 2 }}><StadiumStripes /></div>

      {/* Luzes de estádio (z2) */}
      <StadiumLight left="-10%"  top="0%"   color="rgba(0,180,70,0.09)"   delay={0} />
      <StadiumLight left="70%"   top="-5%"  color="rgba(255,215,0,0.08)"  delay={1} />
      <StadiumLight left="-5%"   top="60%"  color="rgba(0,156,59,0.07)"   delay={2} />
      <StadiumLight left="75%"   top="55%"  color="rgba(255,200,0,0.07)"  delay={1.5} />

      {/* Decorativos — visíveis apenas em telas maiores (sm+) */}
      <div className="hidden sm:block">
        <SoccerBall style={{ left: '4%',  top: '18%',    zIndex: 3 }} delay={1.0} size={36} />
        <SoccerBall style={{ right: '5%', top: '25%',    zIndex: 3 }} delay={1.3} size={28} />
        <SoccerBall style={{ left: '8%',  bottom: '22%', zIndex: 3 }} delay={1.6} size={32} />
        <SoccerBall style={{ right: '7%', bottom: '18%', zIndex: 3 }} delay={1.9} size={24} />
        <FloatingStar style={{ left: '12%', top: '12%',     zIndex: 3 }} delay={0.8}  size={20} />
        <FloatingStar style={{ right: '10%', top: '15%',    zIndex: 3 }} delay={1.1}  size={16} />
        <FloatingStar style={{ left: '18%', bottom: '30%',  zIndex: 3 }} delay={1.4}  size={18} />
        <FloatingStar style={{ right: '14%', bottom: '25%', zIndex: 3 }} delay={1.7}  size={14} />
        <FloatingStar style={{ left: '50%', top: '8%',      zIndex: 3 }} delay={0.6}  size={12} />
        <FloatingStar style={{ right: '22%', top: '40%',    zIndex: 3 }} delay={2.0}  size={10} />
        <Trophy style={{ right: '3%', top: '42%',   zIndex: 3 }} delay={1.2} />
        <Trophy style={{ left: '2%', bottom: '35%', zIndex: 3 }} delay={1.8} />
        <BRFlag style={{ left: '3%',  top: '35%',    zIndex: 3 }} delay={1.0} />
        <BRFlag style={{ right: '3%', bottom: '38%', zIndex: 3 }} delay={1.5} />
      </div>

      {/* Mini-cards flutuantes — apenas sm+ */}
      <motion.div
        className="absolute inset-0 pointer-events-none hidden sm:block"
        style={{ x: springX, y: springY, zIndex: 4 }}
      >
        {FLOAT_CARDS.map((c, i) => <FloatCard key={i} card={c} />)}
      </motion.div>

      {/* ── HERO ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto gap-5">

        {/* Badge Copa */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 rounded-full px-5 py-2 font-raj font-black text-sm tracking-widest uppercase"
          style={{
            background: 'linear-gradient(90deg, rgba(0,156,59,0.25), rgba(255,223,0,0.15), rgba(0,156,59,0.25))',
            border: '1px solid rgba(255,223,0,0.3)',
            color: '#FFDF00',
          }}
        >
          <span>⚽</span>
          <span>Copa do Mundo 2026</span>
          <span>🏆</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="font-bebas leading-none"
          style={{ fontSize: 'clamp(52px, 10vw, 90px)', lineHeight: 0.9 }}
        >
          <span className="text-white">Crie sua </span>
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #009C3B, #00e05a, #FFDF00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            figurinha
          </span>
          <br />
          <span className="text-white">oficial da Copa</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="text-white/55 font-raj text-lg font-medium max-w-sm"
        >
          Transforme <b className="text-white/85">você e sua família</b> em cards
          oficiais da Copa. Premium, personalizados e ultra-compartilháveis.
        </motion.p>

        {/* Stars row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex items-center gap-1.5"
        >
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              style={{ color: '#FFD700', fontSize: 18, filter: 'drop-shadow(0 0 6px #FFD70088)' }}
            >★</motion.span>
          ))}
          <span className="text-white/40 font-raj text-xs ml-2">+8.000 figurinhas criadas</span>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="px-12 py-5 rounded-2xl font-raj font-black text-xl tracking-wider text-black mt-1
            relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #009C3B 0%, #00c44a 40%, #FFDF00 100%)',
            boxShadow: '0 0 40px rgba(0,180,70,0.45), 0 0 80px rgba(255,215,0,0.15)',
          }}
        >
          {/* Shimmer effect */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 60%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.5s infinite',
            }}
          />
          <span className="relative z-10">⚽ COMEÇAR AGORA →</span>
        </motion.button>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: '🎨', text: 'Guia premium' },
            { icon: '⚡', text: 'Entrega imediata' },
            { icon: '🔒', text: 'Pagamento seguro' },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-white/40 font-raj font-semibold">
              <span>{icon}</span><span>{text}</span>
            </span>
          ))}
        </motion.div>

        {/* Live feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-1 flex flex-col items-center gap-3"
        >
          <Counter />
          <LiveFeed />
        </motion.div>
      </div>

      {/* Linha verde/amarela embaixo */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <div style={{ height: 3, background: 'linear-gradient(90deg, #009C3B, #FFDF00, #009C3B)' }} />
        <div style={{ height: 80, background: 'linear-gradient(to top, #080f08, transparent)' }} />
      </div>
    </div>
  )
}
