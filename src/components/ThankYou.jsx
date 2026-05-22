import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CARD_STYLES } from '../lib/cardGenerator'

const STYLE_META = {
  panini:    { preview: '/previews/panini.png' },
  neon:      { preview: '/previews/neon.png' },
  retro:     { preview: '/previews/retro.png' },
  legendary: { preview: '/previews/legendary.png' },
  fut:       { preview: '/previews/fut.png' },
}

const STEPS = [
  { icon: '📧', title: 'Verifique seu e-mail', desc: 'Enviamos o guia de personalização premium para o e-mail informado. Cheque também a caixa de spam.' },
  { icon: '📄', title: 'Abra o guia', desc: 'O guia de personalização premium contém todas as instruções para criar sua figurinha da Copa.' },
  { icon: '🎨', title: 'Crie sua figurinha', desc: 'Siga o passo a passo, personalize com sua foto e o estilo escolhido.' },
  { icon: '📱', title: 'Compartilhe!', desc: 'Poste nas redes, desafie amigos e marque @minhasfigurinhadacopa.' },
]

const FAKE_NAMES = ['MARCÃO', 'ANA', 'GUSTAVO', 'FERNANDA', 'LUCAS', 'JÉSSICA', 'CAIO', 'RAFAELA']
const FAKE_STYLES = ['FUT', 'NEON', 'PANINI', 'LENDÁRIA', 'RETRÔ']

function LiveFeed() {
  const [items, setItems] = useState(
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      name: FAKE_NAMES[i],
      style: FAKE_STYLES[i % FAKE_STYLES.length],
      ago: `${Math.floor(Math.random() * 5) + 1}min atrás`,
    }))
  )
  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev => [{
        id: Date.now(),
        name: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
        style: FAKE_STYLES[Math.floor(Math.random() * FAKE_STYLES.length)],
        ago: 'agora',
      }, ...prev.slice(0, 5)])
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-2">
      <p className="text-xs text-white/30 font-raj font-semibold uppercase tracking-widest mb-1">
        🔴 Compraram agora
      </p>
      {items.slice(0, 4).map((it, i) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1 - i * 0.18, x: 0 }}
          className="flex items-center gap-2 text-xs font-raj"
        >
          <span className="text-ng shrink-0">⚽</span>
          <span className="text-white/80 font-bold">{it.name}</span>
          <span className="text-white/35">comprou estilo</span>
          <span className="text-ng/60 font-bold">{it.style}</span>
          <span className="text-white/25 ml-auto">{it.ago}</span>
        </motion.div>
      ))}
    </div>
  )
}

function Counter() {
  const [n, setN] = useState(8342 + Math.floor(Math.random() * 300))
  useEffect(() => {
    const id = setInterval(() => setN(c => c + Math.floor(Math.random() * 3) + 1), 2500)
    return () => clearInterval(id)
  }, [])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="glass-ng rounded-2xl px-8 py-4 text-center"
    >
      <div className="font-bebas text-4xl text-ng">{n.toLocaleString('pt-BR')}</div>
      <div className="text-white/50 font-raj text-sm">figurinhas encomendadas</div>
    </motion.div>
  )
}

export default function ThankYou({ answers }) {
  const style = CARD_STYLES[answers.style] || CARD_STYLES.fut
  const previewSrc = STYLE_META[answers.style]?.preview

  const share = (platform) => {
    const text = encodeURIComponent('Eu encomendei minha figurinha oficial da Copa! 🏆 Cria a sua também → ')
    const urls = {
      whatsapp:  `https://wa.me/?text=${text}`,
      instagram: 'https://www.instagram.com/',
      tiktok:    'https://www.tiktok.com/',
    }
    window.open(urls[platform], '_blank')
  }

  return (
    <div className="min-h-dvh w-full flex flex-col items-center py-10 px-4" style={{ overflowY: 'auto' }}>
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 text-center">

        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{ left: `${Math.random() * 100}%`, top: -20,
                background: ['#00FF87','#FFD700','#0099FF','#FF6B00'][i % 4],
                rotate: Math.random() * 360 }}
              animate={{ y: '110vh', rotate: Math.random() * 720 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1.5, ease: 'linear' }}
            />
          ))}
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-6xl"
          >🏆</motion.div>
          <h1 className="font-bebas text-white" style={{ fontSize: 'clamp(38px,8vw,64px)' }}>
            Pedido confirmado!
          </h1>
          <p className="text-white/60 font-raj text-base max-w-sm">
            Em breve você receberá o guia de personalização premium no e-mail{' '}
            <b className="text-white/90">{answers.email || 'informado'}</b>
          </p>
        </motion.div>

        {/* Estilo escolhido */}
        {previewSrc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative"
            style={{ filter: `drop-shadow(0 0 24px ${style.accent}55)` }}
          >
            <img src={previewSrc} alt={style.name}
              className="w-36 rounded-xl block mx-auto"
              style={{ border: `2px solid ${style.accent}44` }} />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-raj font-bold px-2 py-0.5 rounded-full"
                style={{ background: style.accent + '22', color: style.accent, border: `1px solid ${style.accent}33` }}>
                {style.name}
              </span>
            </div>
          </motion.div>
        )}

        {/* E-mail info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-ng rounded-2xl p-5 w-full flex items-start gap-4"
        >
          <span className="text-3xl shrink-0">📧</span>
          <div className="text-left">
            <p className="font-raj font-bold text-white/90">Verifique seu e-mail</p>
            <p className="font-raj text-sm text-white/50 mt-1">
              O guia de personalização foi enviado para <b className="text-ng">{answers.email || 'seu e-mail'}</b>.
              Cheque a caixa de entrada e também o <b className="text-white/70">spam</b>.
            </p>
            {answers.phone && (
              <p className="font-raj text-xs text-white/35 mt-1.5">
                Também enviaremos no WhatsApp <b className="text-white/50">{answers.phone}</b>
              </p>
            )}
          </div>
        </motion.div>

        <Counter />

        {/* Passo a passo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full flex flex-col gap-3"
        >
          <p className="font-raj font-bold text-white/50 text-xs uppercase tracking-widest">
            O que acontece agora
          </p>
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="glass rounded-xl p-4 flex items-start gap-4 text-left"
            >
              <span className="text-2xl shrink-0">{s.icon}</span>
              <div>
                <p className="font-raj font-bold text-white/90 text-sm">{s.title}</p>
                <p className="font-raj text-xs text-white/45 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
              <span className="ml-auto shrink-0 w-6 h-6 rounded-full bg-ng/10 border border-ng/20
                flex items-center justify-center text-ng text-xs font-raj font-bold">
                {i + 1}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Compartilhar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3 w-full"
        >
          <p className="font-raj font-bold text-white/40 text-sm uppercase tracking-widest">
            Conta para os amigos 🔥
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => share('whatsapp')}
              className="flex-1 min-w-[120px] py-3 rounded-xl font-raj font-bold text-sm
                flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff' }}>
              <span>WhatsApp</span>
            </button>

            <button onClick={() => share('instagram')}
              className="flex-1 min-w-[120px] py-3 rounded-xl font-raj font-bold text-sm
                flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff' }}>
              <span>Instagram</span>
            </button>

            <button onClick={() => share('tiktok')}
              className="flex-1 min-w-[120px] py-3 rounded-xl font-raj font-bold text-sm
                flex items-center justify-center gap-2 border border-white/10 transition-all hover:scale-[1.02]"
              style={{ background: '#111', color: '#fff' }}>
              <span>TikTok</span>
            </button>
          </div>
        </motion.div>

        <LiveFeed />

        <p className="text-xs text-white/15 font-raj pb-4">
          Minha Figurinha da Copa · 2026 · feito com ❤️ para os fãs do futebol
        </p>
      </div>
    </div>
  )
}
