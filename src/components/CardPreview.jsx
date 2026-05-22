import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCard } from '../lib/cardGenerator'
import { sendToN8N, EVENTS, buildPayload } from '../lib/webhooks'

const GG_SOLO_URL = import.meta.env.VITE_GGCHECKOUT_SOLO_URL || ''
const GG_FAMILIA_URL = import.meta.env.VITE_GGCHECKOUT_FAMILIA_URL || ''

const LOADING_STEPS = [
  { text: 'Analisando sua foto...', icon: '📸' },
  { text: 'Aplicando template premium...', icon: '🎨' },
  { text: 'Adicionando efeitos holográficos...', icon: '💎' },
  { text: 'Finalizando seu card...', icon: '🏆' },
]

// Aplica marca d'água diagonal no canvas e retorna novo dataURL
function applyWatermark(sourceDataUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      // Desenha a imagem original
      ctx.drawImage(img, 0, 0)

      // Overlay escuro semi-transparente nas bordas
      const vignette = ctx.createRadialGradient(
        img.width / 2, img.height / 2, img.height * 0.2,
        img.width / 2, img.height / 2, img.height * 0.75
      )
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, img.width, img.height)

      // Grade de marcas d'água diagonais
      ctx.save()
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${img.width * 0.055}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const text = 'PRÉVIA • MINHA FIGURINHA DA COPA'
      const step = img.height * 0.28

      for (let row = -1; row < 5; row++) {
        for (let col = -1; col < 3; col++) {
          ctx.save()
          const x = col * img.width * 0.7 + (row % 2 === 0 ? 0 : img.width * 0.35)
          const y = row * step + step / 2
          ctx.translate(x, y)
          ctx.rotate(-Math.PI / 6)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
      ctx.restore()

      // Barra central com "DESBLOQUEIE" centralizada
      const barH = img.height * 0.13
      const barY = img.height * 0.44
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.fillRect(0, barY, img.width, barH)

      ctx.globalAlpha = 1
      ctx.font = `bold ${img.width * 0.065}px Arial, sans-serif`
      ctx.fillStyle = '#00FF87'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🔒 DESBLOQUEIE SEU CARD', img.width / 2, barY + barH / 2)

      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.src = sourceDataUrl
  })
}

function LoadingScreen({ stepIdx }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      <motion.div
        className="w-24 h-24 rounded-full border-2 border-ng/30 flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(0,255,135,0.2)',
            '0 0 0 24px rgba(0,255,135,0)',
            '0 0 0 0 rgba(0,255,135,0)',
          ],
        }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        >
          {LOADING_STEPS[stepIdx]?.icon}
        </motion.span>
      </motion.div>

      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {LOADING_STEPS.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 font-raj text-sm transition-all duration-400
            ${i < stepIdx ? 'text-ng/60' : i === stepIdx ? 'text-white font-bold' : 'text-white/20'}`}>
            <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center border transition-all"
              style={{
                background: i < stepIdx ? '#00FF87' : 'transparent',
                borderColor: i < stepIdx ? '#00FF87' : i === stepIdx ? '#00FF87' : 'rgba(255,255,255,0.1)',
              }}>
              {i < stepIdx
                ? <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                : i === stepIdx
                  ? <span className="w-2 h-2 rounded-full bg-ng animate-ping" />
                  : null}
            </span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>

      <p className="text-ng/50 font-raj text-sm animate-pulse">Aguarde, criando seu card premium...</p>
    </motion.div>
  )
}

export default function CardPreview({ answers, updateAnswer, goNext }) {
  const [phase, setPhase] = useState('loading') // loading | preview | unlocked
  const [stepIdx, setStepIdx] = useState(0)
  const [watermarkedUrl, setWatermarkedUrl] = useState(null)
  const [email, setEmail] = useState(answers.email || '')
  const [phone, setPhone] = useState(answers.phone || '')
  const canvasRef = useRef()

  // Sequência de loading → gera card → aplica marca d'água → mostra preview
  useEffect(() => {
    let cancelled = false
    const delays = [900, 1100, 1000, 900]
    let acc = 0

    delays.forEach((d, i) => {
      acc += d
      setTimeout(() => { if (!cancelled) setStepIdx(i) }, acc - d)
    })

    const totalDelay = delays.reduce((a, b) => a + b, 0)

    setTimeout(async () => {
      if (cancelled) return
      try {
        const canvas = canvasRef.current
        canvas.width = 400
        canvas.height = 560

        let photoImg = null
        if (answers.photoFiles?.[0]) {
          const url = URL.createObjectURL(answers.photoFiles[0])
          photoImg = await new Promise((res, rej) => {
            const img = new Image()
            img.onload = () => res(img)
            img.onerror = rej
            img.src = url
          })
        }

        const result = await generateCard(
          canvas, photoImg,
          answers.style, answers.name, answers.country
        )
        updateAnswer('cardDataUrl', result.dataUrl)
        updateAnswer('overall', result.overall)

        // Aplica marca d'água para o preview
        const wm = await applyWatermark(result.dataUrl)
        if (!cancelled) {
          setWatermarkedUrl(wm)
          setPhase('preview')
          sendToN8N(EVENTS.CARD_GENERATED, buildPayload(answers))
        }
      } catch (e) {
        console.error('[CardPreview]', e)
        if (!cancelled) setPhase('preview')
      }
    }, totalDelay + 200)

    return () => { cancelled = true }
  }, [])

  const checkout = () => {
    updateAnswer('email', email)
    updateAnswer('phone', phone)
    sendToN8N(EVENTS.PAYMENT_INITIATED, buildPayload({ ...answers, email, phone }))

    const url = answers.plan === 'familia' ? GG_FAMILIA_URL : GG_SOLO_URL
    if (!url) {
      // Modo dev: simula pagamento aprovado
      setPhase('unlocked')
      sendToN8N(EVENTS.PAYMENT_CONFIRMED, buildPayload({ ...answers, email, phone }))
    } else {
      window.open(url, '_blank')
    }
  }

  const download = () => {
    if (!answers.cardDataUrl) return
    const a = document.createElement('a')
    a.href = answers.cardDataUrl
    a.download = `figurinha-${(answers.name || 'copa').toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
    sendToN8N(EVENTS.CARD_DOWNLOADED, buildPayload(answers))
    setTimeout(goNext, 600)
  }

  const price = answers.plan === 'familia' ? 'R$30' : 'R$10'
  const planLabel = answers.plan === 'familia' ? 'Família Campeã' : 'Craque Solo'

  return (
    <div className="screen-base py-8" style={{ overflowY: 'auto' }}>
      {/* Canvas oculto para geração */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-8">

        <AnimatePresence mode="wait">

          {/* ── FASE 1: LOADING ── */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm glass rounded-2xl p-8">
              <LoadingScreen stepIdx={stepIdx} />
            </motion.div>
          )}

          {/* ── FASE 2: PREVIEW COM MARCA D'ÁGUA ── */}
          {phase === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
            >
              {/* Card com marca d'água */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, rotateY: 40 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                  className="relative"
                >
                  {watermarkedUrl ? (
                    <img
                      src={watermarkedUrl}
                      alt="Preview com marca d'água"
                      className="rounded-2xl block"
                      style={{
                        width: 220,
                        boxShadow: '0 0 40px rgba(0,255,135,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                      }}
                    />
                  ) : (
                    <div className="w-[220px] h-[308px] rounded-2xl glass flex items-center justify-center">
                      <span className="text-4xl">🎴</span>
                    </div>
                  )}

                  {/* Lock badge */}
                  <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
                    <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-ng/20">
                      <svg className="w-3.5 h-3.5 text-ng" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-ng text-xs font-raj font-bold">PRÉVIA</span>
                    </div>
                  </div>
                </motion.div>

                <p className="text-center text-xs text-white/30 font-raj">
                  Overall <b className="text-gd">{answers.overall || 92}</b> ·{' '}
                  {answers.style?.toUpperCase()} · {answers.name?.toUpperCase()}
                </p>
              </div>

              {/* Painel direito */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-5 w-full max-w-sm"
              >
                <div>
                  <div className="text-gd/80 font-raj font-bold text-sm tracking-widest uppercase mb-2">
                    🏆 Sua figurinha está pronta!
                  </div>
                  <h2 className="font-bebas text-white text-4xl leading-tight">
                    Remova a marca d'água<br />e baixe em HD
                  </h2>
                  <p className="text-white/50 font-raj mt-2 text-sm">
                    Plano <b className="text-white/80">{planLabel}</b> por{' '}
                    <b className="text-gd text-lg">{price}</b>
                  </p>
                </div>

                {/* Inputs de contato */}
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Seu e-mail (para receber o card)"
                    className="neon-input"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="WhatsApp (receba por mensagem)"
                    className="neon-input"
                  />
                </div>

                {/* CTA principal */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={checkout}
                  className="btn-gold py-4 rounded-2xl text-xl w-full"
                >
                  🔓 LIBERAR DOWNLOAD — {price}
                </motion.button>

                {/* Garantias */}
                <div className="glass-ng rounded-xl p-3 grid grid-cols-2 gap-2">
                  {[
                    '✓ Download imediato',
                    '✓ Sem marca d\'água',
                    '✓ Envio no WhatsApp',
                    '✓ Envio por e-mail',
                  ].map(f => (
                    <p key={f} className="text-xs text-ng/70 font-raj">{f}</p>
                  ))}
                </div>

                <p className="text-center text-xs text-white/20 font-raj">
                  🔒 Pagamento seguro · GG Checkout
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ── FASE 3: DESBLOQUEADO ── */}
          {phase === 'unlocked' && (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
            >
              {/* Card limpo */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 160 }}
                className="shrink-0"
              >
                {answers.cardDataUrl && (
                  <img
                    src={answers.cardDataUrl}
                    alt="Sua figurinha"
                    className="rounded-2xl block"
                    style={{
                      width: 220,
                      boxShadow: '0 0 60px rgba(0,255,135,0.25), 0 20px 60px rgba(0,0,0,0.5)',
                    }}
                  />
                )}
              </motion.div>

              <div className="flex flex-col gap-5 w-full max-w-sm">
                <div>
                  <div className="text-ng font-raj font-bold text-sm tracking-widest uppercase mb-2">
                    🎉 Pagamento confirmado!
                  </div>
                  <h2 className="font-bebas text-white text-4xl">Baixe seu card agora</h2>
                  <p className="text-white/50 font-raj mt-2">
                    Pronto para compartilhar com o mundo 🌍
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={download}
                  className="btn-primary py-4 rounded-2xl text-xl w-full"
                >
                  ⬇ BAIXAR FIGURINHA HD
                </motion.button>

                <button onClick={goNext}
                  className="text-white/40 font-raj text-sm hover:text-white/70 transition-colors text-center">
                  Compartilhar nas redes →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
