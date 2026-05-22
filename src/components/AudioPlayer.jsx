import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AudioPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [tooltip, setTooltip] = useState(true)
  const [tried, setTried] = useState(false)

  // Cria o elemento de áudio uma vez
  useEffect(() => {
    const audio = new Audio('/bg-music.mp3')
    audio.loop = true
    audio.volume = 0.55
    audio.preload = 'auto'
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => setReady(true), { once: true })
    audio.addEventListener('ended', () => audio.play().catch(() => {}))

    // Tenta autoplay silencioso assim que possível
    const tryAutoplay = () => {
      if (tried) return
      setTried(true)
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Autoplay bloqueado — aguarda interação do usuário
          setPlaying(false)
        })
    }

    // Tenta no carregamento e também na primeira interação
    audio.addEventListener('canplaythrough', tryAutoplay, { once: true })

    const onInteract = () => {
      if (!playing && !tried) tryAutoplay()
    }
    document.addEventListener('click', onInteract, { once: true })
    document.addEventListener('touchstart', onInteract, { once: true })
    document.addEventListener('keydown', onInteract, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      document.removeEventListener('click', onInteract)
      document.removeEventListener('touchstart', onInteract)
      document.removeEventListener('keydown', onInteract)
    }
  }, [])

  const toggle = useCallback(() => {
    setTooltip(false)
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
  }, [playing])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.5, type: 'spring' }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2"
    >
      <AnimatePresence>
        {tooltip && !playing && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 2 }}
            className="bg-black/80 border border-ng/20 rounded-lg px-3 py-1.5 text-xs text-ng/70
              whitespace-nowrap backdrop-blur font-raj font-semibold"
          >
            🎵 Liga o som!
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggle}
        title={playing ? 'Silenciar música' : 'Ligar música'}
        className={`w-12 h-12 rounded-full flex items-center justify-center
          border backdrop-blur-md transition-all duration-300 relative overflow-hidden
          ${playing
            ? 'bg-ng/10 border-ng/50 shadow-[0_0_20px_rgba(0,255,135,0.35)]'
            : 'bg-black/70 border-white/10 hover:border-ng/35 hover:shadow-[0_0_12px_rgba(0,255,135,0.2)]'
          }`}
      >
        {/* Pulse ring when playing */}
        {playing && (
          <motion.span
            className="absolute inset-0 rounded-full border border-ng/30"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {playing ? (
          /* Equalizer bars */
          <span className="flex gap-[3px] items-end h-5 z-10">
            {[0, 1, 2, 3].map(i => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-ng"
                animate={{ height: ['4px', '16px', '6px', '14px', '4px'] }}
                transition={{ duration: 0.65, delay: i * 0.13, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </span>
        ) : (
          /* Speaker icon */
          <svg className="w-5 h-5 text-white/50 z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>
    </motion.div>
  )
}
