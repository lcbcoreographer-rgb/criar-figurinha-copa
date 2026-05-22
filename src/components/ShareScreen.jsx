import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CARD_STYLES } from '../lib/cardGenerator'
import { sendToN8N, EVENTS, buildPayload } from '../lib/webhooks'

const FAKE_NAMES = ['MARCÃO', 'ANA PAU', 'GUSTAVO', 'FERNANDA', 'PEDRO H', 'JÉSSICA', 'CAIO', 'RAFAELA', 'LUCAS', 'BRUNA', 'MATHEUS', 'CAMILA']
const FAKE_STYLES = ['FUT', 'NEON', 'PANINI', 'LENDÁRIA', 'RETRÔ']
const FAKE_OVERALL = [88, 90, 91, 92, 93, 94, 95, 96, 97, 98]

function FakeCardFeed() {
  const [items, setItems] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: FAKE_NAMES[i % FAKE_NAMES.length],
      style: FAKE_STYLES[i % FAKE_STYLES.length],
      ov: FAKE_OVERALL[i % FAKE_OVERALL.length],
      ago: `${Math.floor(Math.random() * 30) + 1}s atrás`,
    }))
  )

  useEffect(() => {
    const id = setInterval(() => {
      const newItem = {
        id: Date.now(),
        name: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
        style: FAKE_STYLES[Math.floor(Math.random() * FAKE_STYLES.length)],
        ov: FAKE_OVERALL[Math.floor(Math.random() * FAKE_OVERALL.length)],
        ago: 'agora',
      }
      setItems(prev => [newItem, ...prev.slice(0, 7)])
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-2 w-full max-w-sm">
      <p className="text-xs text-white/30 font-raj font-semibold uppercase tracking-widest mb-1">
        🔴 Ao vivo — figurinhas criadas
      </p>
      {items.slice(0, 6).map((it, i) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1 - i * 0.12, x: 0 }}
          className="flex items-center gap-2 text-xs font-raj"
        >
          <span className="text-ng shrink-0">⚽</span>
          <span className="text-white/80 font-bold">{it.name}</span>
          <span className="text-white/35">criou card</span>
          <span className="text-ng/60">{it.style}</span>
          <span className="text-gd/70 ml-auto">{it.ov}</span>
        </motion.div>
      ))}
    </div>
  )
}

function Counter() {
  const [n, setN] = useState(8500 + Math.floor(Math.random() * 500))
  useEffect(() => {
    const id = setInterval(() => setN(c => c + Math.floor(Math.random() * 4) + 1), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="glass-ng rounded-2xl px-8 py-4 text-center"
    >
      <div className="font-bebas text-5xl text-ng">{n.toLocaleString('pt-BR')}</div>
      <div className="text-white/50 font-raj text-sm">figurinhas criadas</div>
    </motion.div>
  )
}

export default function ShareScreen({ answers }) {
  const style = CARD_STYLES[answers.style] || CARD_STYLES.fut
  const shareText = `Eu virei craque da Copa! 🏆 Cria a sua figurinha também em minhasfigurinha.com.br`

  const share = (platform) => {
    sendToN8N(EVENTS.SHARED, { ...buildPayload(answers), platform })
    const encoded = encodeURIComponent(shareText)
    const urls = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      instagram: `https://www.instagram.com/`,
      tiktok: `https://www.tiktok.com/`,
    }
    window.open(urls[platform], '_blank')
  }

  return (
    <div className="screen-base py-8 overflow-y-auto">
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-8 text-center">

        {/* Confetti effect (CSS) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: -20,
                background: ['#00FF87', '#FFD700', '#0099FF', '#FF6B00'][i % 4],
                rotate: Math.random() * 360,
              }}
              animate={{ y: '110vh', rotate: Math.random() * 720 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, ease: 'linear' }}
            />
          ))}
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl"
          >🏆</motion.div>
          <h1 className="font-bebas text-white" style={{ fontSize: 'clamp(44px,9vw,72px)' }}>
            Figurinha criada com sucesso!
          </h1>
          <p className="text-white/50 font-raj text-lg max-w-md">
            Compartilhe sua figurinha e{' '}
            <b className="text-ng">desafie seus amigos</b> a criarem a deles!
          </p>
        </motion.div>

        {/* Card teaser */}
        {answers.cardDataUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateY: 60 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
            className="relative"
            style={{ filter: `drop-shadow(0 0 30px ${style.accent}66)` }}
          >
            <img
              src={answers.cardDataUrl}
              alt="Sua figurinha"
              className="w-40 rounded-xl"
              style={{ boxShadow: `0 0 0 2px ${style.accent}44` }}
            />
          </motion.div>
        )}

        <Counter />

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <p className="text-white/40 font-raj text-sm font-semibold uppercase tracking-widest">
            Compartilhe agora
          </p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => share('whatsapp')}
            className="w-full py-4 rounded-xl font-raj font-black text-lg flex items-center justify-center gap-3
              transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff',
              boxShadow: '0 0 25px rgba(37,211,102,0.35)' }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Compartilhar no WhatsApp
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => share('instagram')}
            className="w-full py-4 rounded-xl font-raj font-black text-lg flex items-center justify-center gap-3
              transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
              color: '#fff', boxShadow: '0 0 25px rgba(253,29,29,0.25)'
            }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Compartilhar no Instagram
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => share('tiktok')}
            className="w-full py-4 rounded-xl font-raj font-black text-lg flex items-center justify-center gap-3
              transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#010101,#333)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 25px rgba(0,0,0,0.5)' }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.21 8.21 0 004.79 1.52V6.73a4.85 4.85 0 01-1.02-.04z"/>
            </svg>
            Compartilhar no TikTok
          </motion.button>
        </motion.div>

        {/* Challenge CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl p-5 w-full max-w-sm"
        >
          <p className="font-raj font-bold text-white/80 mb-3">🔥 Desafio da figurinha</p>
          <p className="text-sm text-white/50 font-raj mb-4">
            Marque seus amigos e desafie-os a criar a figurinha deles.
            Quem tiver o maior overall ganha!
          </p>
          <button
            onClick={() => share('whatsapp')}
            className="w-full py-2.5 rounded-xl text-sm font-raj font-bold text-ng border border-ng/30
              hover:bg-ng/10 transition-all"
          >
            Enviar desafio no WhatsApp →
          </button>
        </motion.div>

        {/* Live feed */}
        <FakeCardFeed />

        {/* Footer */}
        <p className="text-xs text-white/20 font-raj pb-4">
          Minha Figurinha da Copa · 2026 · feito com ❤️ para os fãs do futebol
        </p>
      </div>
    </div>
  )
}
