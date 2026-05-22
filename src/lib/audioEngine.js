let audioCtx = null
let masterGain = null
let nodes = []
let beatTimer = null
let isRunning = false

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function createNoise(ctx, duration) {
  const sr = ctx.sampleRate
  const buf = ctx.createBuffer(1, sr * duration, sr)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function kick(ctx, dest, time) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.connect(g); g.connect(dest)
  osc.frequency.setValueAtTime(180, time)
  osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.45)
  g.gain.setValueAtTime(0.85, time)
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.45)
  osc.start(time); osc.stop(time + 0.5)
}

function hihat(ctx, dest, time, open = false) {
  const buf = createNoise(ctx, 0.1)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'; filter.frequency.value = 7000
  const g = ctx.createGain()
  src.connect(filter); filter.connect(g); g.connect(dest)
  g.gain.setValueAtTime(0.15, time)
  g.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.15 : 0.05))
  src.start(time); src.stop(time + 0.2)
}

function snare(ctx, dest, time) {
  const buf = createNoise(ctx, 0.15)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = 0.8
  const g = ctx.createGain()
  src.connect(filter); filter.connect(g); g.connect(dest)
  g.gain.setValueAtTime(0.4, time); g.gain.exponentialRampToValueAtTime(0.001, time + 0.18)
  src.start(time); src.stop(time + 0.2)
}

function crowdHum(ctx, dest) {
  const buf = createNoise(ctx, 4)
  const src = ctx.createBufferSource()
  src.buffer = buf; src.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'; filter.frequency.value = 600; filter.Q.value = 0.4
  const g = ctx.createGain()
  src.connect(filter); filter.connect(g); g.connect(dest)
  g.gain.value = 0.04; src.start()
  return src
}

function bassLine(ctx, dest, time, notes) {
  notes.forEach(([freq, startOff, dur]) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.connect(g); g.connect(dest)
    const t = time + startOff
    osc.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.18, t + 0.01)
    g.gain.linearRampToValueAtTime(0.18, t + dur - 0.04)
    g.gain.linearRampToValueAtTime(0, t + dur)
    osc.start(t); osc.stop(t + dur + 0.05)
  })
}

export function startAmbient(vol = 0.6) {
  if (isRunning) return
  const ctx = getCtx()
  if (ctx.state === 'suspended') ctx.resume()

  masterGain = ctx.createGain()
  masterGain.gain.value = vol
  masterGain.connect(ctx.destination)

  const compressor = ctx.createDynamicsCompressor()
  compressor.connect(masterGain)

  const crowd = crowdHum(ctx, compressor)
  nodes.push(crowd)

  const BPM = 100
  const beat = 60 / BPM
  let nextBeat = ctx.currentTime + 0.1

  const BASS_NOTES = [
    [73.4, 0, beat * 0.9], [87.3, beat, beat * 0.9],
    [73.4, beat * 2, beat * 0.9], [98.0, beat * 3, beat * 0.9],
  ]

  function scheduleMeasure() {
    const t = nextBeat
    kick(ctx, compressor, t)
    hihat(ctx, compressor, t, false)
    hihat(ctx, compressor, t + beat * 0.5, false)
    kick(ctx, compressor, t + beat * 0.75)
    snare(ctx, compressor, t + beat)
    hihat(ctx, compressor, t + beat * 1.25)
    hihat(ctx, compressor, t + beat * 1.5, true)
    hihat(ctx, compressor, t + beat * 1.75)
    kick(ctx, compressor, t + beat * 2)
    hihat(ctx, compressor, t + beat * 2.25)
    kick(ctx, compressor, t + beat * 2.5)
    snare(ctx, compressor, t + beat * 3)
    hihat(ctx, compressor, t + beat * 3.5)
    hihat(ctx, compressor, t + beat * 3.75)
    bassLine(ctx, compressor, t, BASS_NOTES)
    nextBeat += beat * 4
  }

  scheduleMeasure()
  beatTimer = setInterval(() => {
    if (ctx.currentTime + 0.2 >= nextBeat) scheduleMeasure()
  }, 40)

  isRunning = true
}

export function stopAmbient() {
  if (!isRunning) return
  clearInterval(beatTimer)
  nodes.forEach(n => { try { n.stop() } catch (_) {} })
  nodes = []
  if (masterGain) { masterGain.gain.setValueAtTime(masterGain.gain.value, getCtx().currentTime)
    masterGain.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.3) }
  setTimeout(() => { isRunning = false; masterGain = null }, 400)
}

export function setVolume(v) {
  if (masterGain) masterGain.gain.value = v
}

export function isPlaying() { return isRunning }
