import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendToN8N, EVENTS, buildPayload } from '../lib/webhooks'

function UploadZone({ onFiles, plan }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()
  const max = plan === 'familia' ? 5 : 1

  const handle = (fileList) => {
    const valid = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, max)
    if (valid.length) onFiles(valid)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
        flex flex-col items-center justify-center gap-5 py-14 px-8 select-none
        ${drag
          ? 'border-ng bg-ng/5 scale-[1.02]'
          : 'border-white/15 hover:border-ng/40 hover:bg-ng/3'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="hidden"
        onChange={e => handle(e.target.files)}
      />

      <motion.div
        animate={{ y: drag ? -8 : 0 }}
        className="w-20 h-20 rounded-full bg-ng/10 border border-ng/20 flex items-center justify-center"
      >
        <svg className="w-9 h-9 text-ng/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </motion.div>

      <div className="text-center">
        <p className="font-raj font-bold text-white/80 text-lg">
          {drag ? 'Solte a foto aqui!' : 'Arraste ou clique para enviar'}
        </p>
        <p className="font-raj text-sm text-white/35 mt-1">
          {plan === 'familia' ? `Até ${max} fotos · ` : ''}
          PNG ou JPG · Recomendado: rosto visível, fundo claro
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {['Centralização automática', 'Remoção de fundo', 'Geração do card'].map(f => (
          <span key={f} className="text-xs text-ng/50 font-raj bg-ng/5 rounded-full px-3 py-1 border border-ng/10">
            ✓ {f}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

export default function PhotoUpload({ answers, updateAnswer, goNext, goBack }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])

  const handleFiles = useCallback((fileList) => {
    setFiles(fileList)
    const urls = fileList.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    updateAnswer('photoFiles', fileList)
  }, [updateAnswer])

  const removeFile = (i) => {
    const nf = files.filter((_, idx) => idx !== i)
    const np = previews.filter((_, idx) => idx !== i)
    setFiles(nf); setPreviews(np)
    updateAnswer('photoFiles', nf)
  }

  const proceed = () => {
    sendToN8N(EVENTS.PHOTO_UPLOADED, { ...buildPayload(answers), fotos: files.length })
    goNext()
  }

  const max = answers.plan === 'familia' ? 5 : 1
  const canAdd = files.length < max

  return (
    <div className="screen-base py-8" style={{ overflowY: 'auto' }}>
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-6">

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="font-bebas text-white text-4xl sm:text-5xl">
            {answers.plan === 'familia' ? 'Fotos da família' : 'Envie sua foto'}
          </h2>
          <p className="text-white/40 font-raj mt-2">
            {answers.plan === 'familia'
              ? 'Cada membro terá seu próprio card — até 5 fotos'
              : 'Vamos transformar você em um craque da Copa'}
          </p>
        </motion.div>

        {/* Upload zone (só aparece se ainda pode adicionar) */}
        <AnimatePresence>
          {canAdd && (
            <motion.div
              key="zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            >
              <UploadZone onFiles={handleFiles} plan={answers.plan} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previews das fotos selecionadas */}
        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3"
            >
              {previews.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative group"
                >
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-ng/30"
                  />
                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500
                      flex items-center justify-center opacity-0 group-hover:opacity-100
                      transition-opacity text-white text-xs font-bold"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <span className="text-[10px] font-raj font-bold text-white/80 bg-black/60 rounded px-1">
                      Foto {i + 1}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Botão de adicionar mais (se família e ainda tem vaga) */}
              {answers.plan === 'familia' && files.length < max && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => {}} // a UploadZone já cuida do click
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20
                    hover:border-ng/40 flex items-center justify-center text-white/30
                    hover:text-ng/60 transition-all text-3xl"
                >
                  +
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info de dica */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-3 flex items-start gap-2.5"
          >
            <span className="text-lg shrink-0">💡</span>
            <p className="text-xs text-white/50 font-raj leading-relaxed">
              Fotos com <b className="text-white/70">rosto centralizado</b> e{' '}
              <b className="text-white/70">fundo claro/uniforme</b> geram os melhores resultados.
              Você verá uma prévia com marca d'água antes de pagar.
            </p>
          </motion.div>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={goBack}
            className="flex-none px-5 py-3.5 rounded-xl border border-white/10 text-white/50
              hover:text-white/80 hover:border-white/20 transition-all font-raj font-bold text-sm"
          >
            ← Voltar
          </button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={proceed}
            disabled={files.length === 0}
            className="flex-1 btn-gold py-3.5 rounded-xl text-lg
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {files.length === 0
              ? 'Envie ao menos 1 foto'
              : `🎨 Gerar minha figurinha${files.length > 1 ? ` (${files.length} fotos)` : ''}`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
