import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Landing from './components/Landing'
import QuizCountry from './components/QuizCountry'
import QuizPrediction from './components/QuizPrediction'
import QuizStyle from './components/QuizStyle'
import QuizName from './components/QuizName'
import Checkout from './components/Checkout'
import ThankYou from './components/ThankYou'
import AudioPlayer from './components/AudioPlayer'
import Particles from './components/Particles'

const SCREENS = [
  'landing',
  'country',
  'prediction',
  'style',
  'name',
  'checkout',
  'thankyou',
]

const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-60%', opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit:  (dir) => ({ x: dir > 0 ? '-60%' : '100%', opacity: 0, scale: 0.98 }),
}
const pageTransition = { type: 'tween', duration: 0.22, ease: 'easeInOut' }

export default function App() {
  const [screen, setScreen] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState({
    country: '', prediction: '', style: 'fut', name: '',
    plan: 'solo', email: '', phone: '',
  })

  const updateAnswer = (k, v) => setAnswers(prev => ({ ...prev, [k]: v }))

  const goNext = () => {
    setDir(1)
    setScreen(s => Math.min(s + 1, SCREENS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setDir(-1)
    setScreen(s => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const current = SCREENS[screen]
  const props = { answers, updateAnswer, goNext, goBack }

  const screenMap = {
    landing:    Landing,
    country:    QuizCountry,
    prediction: QuizPrediction,
    style:      QuizStyle,
    name:       QuizName,
    checkout:   Checkout,
    thankyou:   ThankYou,
  }
  const Screen = screenMap[current]

  // Dots apenas nas telas do quiz (1-5)
  const quizScreens = SCREENS.slice(1, 6)
  const isQuiz = screen >= 1 && screen <= 5

  return (
    <div className="relative min-h-dvh bg-dark overflow-hidden">
      {/* Vídeo de fundo global — todas as telas */}
      <video
        autoPlay muted loop playsInline disablePictureInPicture
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'cover', opacity: 0.12, zIndex: 0 }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay escuro sobre o vídeo */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(5,10,5,0.78) 0%, rgba(5,10,5,0.96) 100%)' }} />

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,135,0.04) 0%, transparent 60%)' }} />
        <Particles count={28} color="#00FF87" />
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={current}
          custom={dir}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
          className="min-h-dvh w-full"
        >
          <Screen {...props} />
        </motion.div>
      </AnimatePresence>

      <AudioPlayer />

      {/* Progress dots do quiz */}
      {isQuiz && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1.5">
          {quizScreens.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width:  i === screen - 1 ? 20 : 6,
                height: 6,
                background: i < screen - 1 ? '#00FF87'
                  : i === screen - 1 ? '#00FF87'
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
