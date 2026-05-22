import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AudioPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [tooltip, setTooltip] = useState(false)
  const playedRef = useRef(false)

  useEffect(() => {
    const audio = new Audio('/bg-music.mp3')
    audio.loop = true
    audio.volume = 0.5
    audio.preload = 'auto'
    audioRef.current = audio

    // Tenta autoplay assim que carrega
    const tryAutoplay = () => {
      if (playedRef.current) return
      audio.play().then(() => {
        playedRef.current = true
        setPlaying(true)
      }).catch(() => {
        // Bloqueado — mostra tooltip após 2s
        setTimeout(() => setTooltip(true), 2000)
      })
    }

    // Tenta imediatamente quando áudio está pronto
    if (audio.readyState >= 2) {
      tryAutoplay()
    } else {
      audio.addEventListener('canplay', tryAutoplay, { once: true })
    }

    // Fallback: qualquer interação do usuário dispara a música
    // IMPORTANTE: audio.play() deve ser chamado DENTRO do handler (sincrono) para iOS
    const onInteract = () => {
      if (playedRef.current) return
      audio.play().then(() => {
        playedRef.current = true
        setPlaying(true)
        setTooltip(false)
      }).catch(() => {})
    }

    const EVENTS = ['touchstart', 'touchend', 'click', 'keydown', 'scroll']
    EVENTS.forEach(e => document.addEventListener(e, onInteract, { once: false, passive: true }))

    // Limpa depois que tocar pela primeira vez
    const cleanup = () => EVENTS.forEach(e => document.removeEventListener(e, onInteract))
    audio.addEventListener('play', cleanup, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      cleanup()
    }
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setTooltip(false)

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => {
        playedRef.current = true
        setPlaying(true)
      }).catch(() => {})
    }
  }, [playing])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.8, type: 'spring' }}
      className="fixed bottom-5 right-4 z-50 flex items-center gap-2"
    >
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-black/90 border border-ng/30 rounded-xl px-3 py-2 text-xs
              text-ng/90 whitespace-nowrap backdrop-blur font-raj font-bold
              shadow-[0_0_20px_rgba(0,255,135,0.2)]"
          >
            🎵 Toque para ouvir!
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggle}
        title={playing ? 'Silenciar' : 'Ligar música'}
        className={`w-11 h-11 rounded-full flex items-center justify-center
          border backdrop-blur-md transition-all duration-300 relative overflow-hidden
          ${playing
            ? 'bg-ng/10 border-ng/50 shadow-[0_0_20px_rgba(0,255,135,0.35)]'
            : 'bg-black/80 border-white/15 hover:border-ng/40'}`}
      >
        {playing && (
          <motion.span className="absolute inset-0 rounded-full border border-ng/30"
            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }} />
        )}
        {playing ? (
          <span className="flex gap-[3px] items-end h-4 z-10">
            {[0, 1, 2, 3].map(i => (
              <motion.span key={i} className="w-[3px] rounded-full bg-ng"
                animate={{ height: ['3px', '14px', '5px', '12px', '3px'] }}
                transition={{ duration: 0.65, delay: i * 0.13, repeat: Infinity }} />
            ))}
          </span>
        ) : (
          <svg className="w-5 h-5 text-white/50 z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>
    </motion.div>
  )
}
