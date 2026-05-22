const POSITIONS = ['ATA', 'MEI', 'LAT', 'ZAG', 'VOL', 'PNT', 'GOL']
const COUNTRY_CODES = {
  brasil: 'BRA', argentina: 'ARG', portugal: 'POR',
  franca: 'FRA', alemanha: 'ALE', espanha: 'ESP', outro: 'INT',
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1) + min) }

function generateStats() {
  const base = rand(82, 94)
  return {
    VEL: rand(base - 8, Math.min(99, base + 5)),
    FIN: rand(base - 8, Math.min(99, base + 5)),
    PAS: rand(base - 8, Math.min(99, base + 5)),
    DRI: rand(base - 8, Math.min(99, base + 5)),
    DEF: rand(base - 8, Math.min(99, base + 5)),
    TIS: rand(base - 8, Math.min(99, base + 5)),
  }
}

function computeOverall(name) {
  const base = 85 + (name.length % 8)
  return Math.min(99, base + rand(0, 4))
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCorners(ctx, w, h, size, color) {
  ctx.fillStyle = color
  ;[
    [0, 0, size, 0, 0, size],
    [w, 0, w - size, 0, w, size],
    [0, h, size, h, 0, h - size],
    [w, h, w - size, h, w, h - size],
  ].forEach(([ax, ay, bx, by, cx, cy]) => {
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.fill()
  })
}

function drawScanLines(ctx, w, h) {
  for (let y = 0; y < h; y += 5) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fillRect(0, y, w, 1)
  }
}

function placePhoto(ctx, photo, x, y, w, h, clip) {
  if (!photo) return
  ctx.save()
  if (clip === 'circle') {
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2)
    ctx.clip()
  } else if (clip === 'rect') {
    roundRect(ctx, x, y, w, h, 8)
    ctx.clip()
  }
  const imgAR = photo.naturalWidth / photo.naturalHeight
  const boxAR = w / h
  let sx, sy, sw, sh
  if (imgAR > boxAR) {
    sh = photo.naturalHeight; sw = sh * boxAR
    sx = (photo.naturalWidth - sw) / 2; sy = 0
  } else {
    sw = photo.naturalWidth; sh = sw / boxAR
    sx = 0; sy = (photo.naturalHeight - sh) / 2 * 0.3
  }
  ctx.drawImage(photo, sx, sy, sw, sh, x, y, w, h)
  ctx.restore()
}

async function drawFUT(ctx, W, H, photo, name, country, overall, stats) {
  // Background
  const bg = ctx.createRadialGradient(W * 0.5, H * 0.25, 0, W * 0.5, H * 0.5, H)
  bg.addColorStop(0, '#4a1a00')
  bg.addColorStop(0.4, '#1e0800')
  bg.addColorStop(1, '#050000')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Outer glow
  const glow = ctx.createRadialGradient(W / 2, H / 3, 0, W / 2, H / 3, W * 0.8)
  glow.addColorStop(0, 'rgba(255,180,0,0.08)'); glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)

  // Gold border
  const gb = ctx.createLinearGradient(0, 0, W, H)
  gb.addColorStop(0, '#6B4F10'); gb.addColorStop(0.35, '#FFD700')
  gb.addColorStop(0.65, '#FFD700'); gb.addColorStop(1, '#6B4F10')
  ctx.strokeStyle = gb; ctx.lineWidth = 7
  roundRect(ctx, 3.5, 3.5, W - 7, H - 7, 10); ctx.stroke()

  // Inner border
  ctx.strokeStyle = 'rgba(255,215,0,0.18)'; ctx.lineWidth = 1
  roundRect(ctx, 14, 14, W - 28, H - 28, 6); ctx.stroke()

  drawCorners(ctx, W, H, 22, 'rgba(255,215,0,0.55)')

  // Rating
  ctx.font = `bold 88px 'Bebas Neue', sans-serif`
  const rg = ctx.createLinearGradient(18, 20, 18, 108)
  rg.addColorStop(0, '#FFFFFF'); rg.addColorStop(1, '#FFD700')
  ctx.fillStyle = rg
  ctx.shadowColor = 'rgba(255,215,0,0.6)'; ctx.shadowBlur = 12
  ctx.fillText(overall, 22, 105)
  ctx.shadowBlur = 0

  ctx.font = `bold 22px 'Rajdhani', sans-serif`
  ctx.fillStyle = '#FFD700'
  const pos = POSITIONS[rand(0, POSITIONS.length - 1)]
  ctx.fillText(pos, 24, 128)
  const code = COUNTRY_CODES[country] || 'BRA'
  ctx.fillText(code, 24, 152)

  // Photo
  const pX = 55, pY = 16, pW = W - 80, pH = Math.floor(H * 0.54)
  ctx.save()
  ctx.shadowColor = 'rgba(255,200,0,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8
  placePhoto(ctx, photo, pX, pY, pW, pH, 'rect')
  ctx.restore()

  // Photo fade
  const fade = ctx.createLinearGradient(0, pY + pH * 0.55, 0, pY + pH)
  fade.addColorStop(0, 'rgba(5,0,0,0)'); fade.addColorStop(1, 'rgba(5,0,0,1)')
  ctx.fillStyle = fade; ctx.fillRect(pX, pY + pH * 0.55, pW, pH * 0.45)

  // Separator
  const sepY = H * 0.595
  const sg = ctx.createLinearGradient(18, 0, W - 18, 0)
  sg.addColorStop(0, 'rgba(255,215,0,0)'); sg.addColorStop(0.35, '#FFD700')
  sg.addColorStop(0.65, '#FFD700'); sg.addColorStop(1, 'rgba(255,215,0,0)')
  ctx.fillStyle = sg; ctx.fillRect(18, sepY, W - 36, 1.5)

  // Name
  ctx.textAlign = 'center'
  ctx.font = `bold 42px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'rgba(255,215,0,0.4)'; ctx.shadowBlur = 8
  ctx.fillText(name.toUpperCase().slice(0, 15), W / 2, sepY + 44)
  ctx.shadowBlur = 0

  // Stats
  const stY = sepY + 60
  const stW = (W - 36) / 3
  Object.entries(stats).forEach(([k, v], i) => {
    const row = Math.floor(i / 3), col = i % 3
    const cx = 18 + col * stW + stW / 2
    const cy = stY + row * 48

    ctx.font = `bold 27px 'Rajdhani', sans-serif`
    ctx.fillStyle = '#FFF'; ctx.fillText(v, cx, cy)
    ctx.font = `600 11px 'Rajdhani', sans-serif`
    ctx.fillStyle = 'rgba(255,215,0,0.75)'; ctx.fillText(k, cx, cy + 16)
  })
  ctx.textAlign = 'left'

  // Bottom glow
  const bg2 = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.6)
  bg2.addColorStop(0, 'rgba(255,180,0,0.12)'); bg2.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = bg2; ctx.fillRect(0, H - 90, W, 90)
}

async function drawNeon(ctx, W, H, photo, name, country, overall, stats) {
  ctx.fillStyle = '#030310'; ctx.fillRect(0, 0, W, H)

  // BG glow
  const bg = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.9)
  bg.addColorStop(0, 'rgba(0,255,135,0.07)'); bg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Border
  ctx.shadowColor = '#00FF87'; ctx.shadowBlur = 18
  ctx.strokeStyle = '#00FF87'; ctx.lineWidth = 2
  roundRect(ctx, 9, 9, W - 18, H - 18, 8); ctx.stroke()
  ctx.shadowBlur = 0

  ctx.strokeStyle = 'rgba(0,255,135,0.18)'; ctx.lineWidth = 1
  roundRect(ctx, 16, 16, W - 32, H - 32, 5); ctx.stroke()

  // Top label
  ctx.font = `600 11px 'Rajdhani', sans-serif`
  ctx.fillStyle = '#00FF87'; ctx.textAlign = 'center'
  ctx.fillText('◆  NEON PREMIUM  ◆', W / 2, 35)
  ctx.textAlign = 'left'

  // Rating
  ctx.font = `bold 82px 'Bebas Neue', sans-serif`
  const rg = ctx.createLinearGradient(20, 42, 20, 120)
  rg.addColorStop(0, '#00FF87'); rg.addColorStop(1, '#0099FF')
  ctx.fillStyle = rg
  ctx.shadowColor = '#00FF87'; ctx.shadowBlur = 14
  ctx.fillText(overall, 24, 110)
  ctx.shadowBlur = 0

  ctx.font = `bold 20px 'Rajdhani', sans-serif`
  ctx.fillStyle = '#00FF87'
  ctx.fillText(POSITIONS[rand(0, POSITIONS.length - 1)], 26, 132)
  ctx.fillStyle = '#0099FF'
  ctx.fillText(COUNTRY_CODES[country] || 'BRA', 26, 152)

  // Circular photo
  const cx = W / 2, cy = H * 0.36, r = W * 0.35
  ctx.shadowColor = '#00FF87'; ctx.shadowBlur = 22
  ctx.strokeStyle = '#00FF87'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.shadowBlur = 0

  // Secondary ring
  ctx.strokeStyle = 'rgba(0,255,135,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.stroke()

  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, Math.PI * 2); ctx.clip()
  ctx.fillStyle = '#080818'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  if (photo) {
    placePhoto(ctx, photo, cx - r + 3, cy - r + 3, (r - 3) * 2, (r - 3) * 2, null)
  }
  ctx.restore()

  drawScanLines(ctx, W, H)

  // Sep
  const sepY = H * 0.63
  const sg = ctx.createLinearGradient(18, 0, W - 18, 0)
  sg.addColorStop(0, 'rgba(0,255,135,0)'); sg.addColorStop(0.5, '#00FF87')
  sg.addColorStop(1, 'rgba(0,255,135,0)')
  ctx.fillStyle = sg; ctx.fillRect(18, sepY, W - 36, 1.5)

  // Name
  ctx.textAlign = 'center'
  const ng2 = ctx.createLinearGradient(0, 0, W, 0)
  ng2.addColorStop(0, '#00FF87'); ng2.addColorStop(1, '#0099FF')
  ctx.font = `bold 38px 'Bebas Neue', sans-serif`
  ctx.fillStyle = ng2
  ctx.shadowColor = '#00FF87'; ctx.shadowBlur = 10
  ctx.fillText(name.toUpperCase().slice(0, 15), W / 2, sepY + 40)
  ctx.shadowBlur = 0

  const stY = sepY + 55, stW = (W - 36) / 3
  Object.entries(stats).forEach(([k, v], i) => {
    const row = Math.floor(i / 3), col = i % 3
    const x = 18 + col * stW + stW / 2, y = stY + row * 44
    ctx.font = `bold 24px 'Rajdhani', sans-serif`; ctx.fillStyle = '#FFF'; ctx.fillText(v, x, y)
    ctx.font = `600 11px 'Rajdhani', sans-serif`; ctx.fillStyle = '#00FF87'; ctx.fillText(k, x, y + 15)
  })
  ctx.textAlign = 'left'

  // Holographic overlay
  const holo = ctx.createLinearGradient(0, 0, W, H)
  holo.addColorStop(0, 'rgba(0,255,135,0)'); holo.addColorStop(0.5, 'rgba(255,255,255,0.025)')
  holo.addColorStop(1, 'rgba(0,153,255,0)')
  ctx.fillStyle = holo; ctx.fillRect(0, 0, W, H)
}

async function drawPanini(ctx, W, H, photo, name, country, overall, stats) {
  // Cream background
  ctx.fillStyle = '#F8F3E8'; ctx.fillRect(0, 0, W, H)

  // Brasil colors border
  const borderColors = ['#009C3B', '#FFDF00', '#009C3B']
  const bw = 12
  borderColors.forEach((c, i) => {
    ctx.strokeStyle = c; ctx.lineWidth = 3
    const off = i * 3 + 2
    ctx.strokeRect(off, off, W - off * 2, H - off * 2)
  })

  // Header area
  const hg = ctx.createLinearGradient(0, 0, W, 0)
  hg.addColorStop(0, '#009C3B'); hg.addColorStop(0.5, '#00B843'); hg.addColorStop(1, '#009C3B')
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 60)

  // Header text
  ctx.font = `bold 24px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#FFDF00'; ctx.textAlign = 'center'
  ctx.fillText('COPA DO MUNDO', W / 2, 40)
  ctx.textAlign = 'left'

  // Number badge (top-right)
  ctx.fillStyle = '#FFDF00'
  ctx.beginPath(); ctx.arc(W - 35, 35, 22, 0, Math.PI * 2); ctx.fill()
  ctx.font = `bold 18px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#000'; ctx.textAlign = 'center'
  ctx.fillText(overall, W - 35, 41)
  ctx.textAlign = 'left'

  // Oval photo area
  const ox = W / 2, oy = 190, orx = W * 0.38, ory = H * 0.27
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(ox, oy, orx, ory, 0, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = '#ddd'; ctx.fillRect(ox - orx, oy - ory, orx * 2, ory * 2)
  if (photo) placePhoto(ctx, photo, ox - orx, oy - ory, orx * 2, ory * 2, null)
  ctx.restore()

  // Oval border
  ctx.strokeStyle = '#009C3B'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.ellipse(ox, oy, orx, ory, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = '#FFDF00'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.ellipse(ox, oy, orx + 5, ory + 5, 0, 0, Math.PI * 2); ctx.stroke()

  // Stars
  ctx.font = '14px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('★ ★ ★ ★ ★', W / 2, 355)

  // Player name
  ctx.font = `bold 38px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#111'
  ctx.fillText(name.toUpperCase().slice(0, 15), W / 2, 395)

  // Position + country
  ctx.font = `600 16px 'Rajdhani', sans-serif`
  ctx.fillStyle = '#009C3B'
  const pos = POSITIONS[rand(0, POSITIONS.length - 1)]
  ctx.fillText(`${pos}  ·  ${COUNTRY_CODES[country] || 'BRA'}`, W / 2, 420)

  // Divider
  const dg = ctx.createLinearGradient(20, 0, W - 20, 0)
  dg.addColorStop(0, 'rgba(0,156,59,0)'); dg.addColorStop(0.5, '#009C3B'); dg.addColorStop(1, 'rgba(0,156,59,0)')
  ctx.fillStyle = dg; ctx.fillRect(20, 432, W - 40, 1.5)

  // Stats
  const stY = 455, stW = (W - 30) / 3
  Object.entries(stats).forEach(([k, v], i) => {
    const row = Math.floor(i / 3), col = i % 3
    const x = 15 + col * stW + stW / 2, y = stY + row * 44
    ctx.font = `bold 26px 'Rajdhani', sans-serif`; ctx.fillStyle = '#111'; ctx.fillText(v, x, y)
    ctx.font = `600 11px 'Rajdhani', sans-serif`; ctx.fillStyle = '#009C3B'; ctx.fillText(k, x, y + 15)
  })
  ctx.textAlign = 'left'

  // Panini logo area (bottom)
  ctx.font = `600 13px 'Rajdhani', sans-serif`; ctx.fillStyle = '#999'; ctx.textAlign = 'center'
  ctx.fillText('MINHA FIGURINHA DA COPA', W / 2, H - 16)
  ctx.textAlign = 'left'
}

async function drawLegendary(ctx, W, H, photo, name, country, overall, stats) {
  ctx.fillStyle = '#050500'; ctx.fillRect(0, 0, W, H)

  // Gold BG glow
  const bg = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W)
  bg.addColorStop(0, 'rgba(255,180,0,0.12)'); bg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Particle dots
  for (let i = 0; i < 60; i++) {
    const px = rand(10, W - 10), py = rand(10, H - 10)
    const ps = Math.random() * 2 + 0.5
    ctx.fillStyle = `rgba(255,215,0,${Math.random() * 0.4 + 0.1})`
    ctx.beginPath(); ctx.arc(px, py, ps, 0, Math.PI * 2); ctx.fill()
  }

  // Triple gold border
  [[3.5, 7, 'rgba(255,215,0,0.25)'], [9, 3, 'rgba(255,215,0,0.5)'], [15, 2, 'rgba(255,215,0,0.8)']].forEach(([off, lw, col]) => {
    ctx.strokeStyle = col; ctx.lineWidth = lw
    roundRect(ctx, off, off, W - off * 2, H - off * 2, 10); ctx.stroke()
  })

  // Corner ornaments (bigger)
  drawCorners(ctx, W, H, 30, 'rgba(255,215,0,0.7)')

  // Crown icon (top center)
  ctx.font = '28px sans-serif'; ctx.textAlign = 'center'
  ctx.fillStyle = '#FFD700'; ctx.fillText('👑', W / 2, 48)
  ctx.textAlign = 'left'

  // Rating
  ctx.font = `bold 92px 'Bebas Neue', sans-serif`
  ctx.textAlign = 'center'
  const rg = ctx.createLinearGradient(0, 20, 0, 118)
  rg.addColorStop(0, '#FFF9E6'); rg.addColorStop(0.5, '#FFD700'); rg.addColorStop(1, '#8B6914')
  ctx.fillStyle = rg
  ctx.shadowColor = 'rgba(255,215,0,0.8)'; ctx.shadowBlur = 20
  ctx.fillText(overall, W / 2, 118)
  ctx.shadowBlur = 0

  // Hexagonal photo (simulated with clipped rect)
  const pw = W * 0.68, ph = pw * 1.1
  const px = (W - pw) / 2, py = 130
  ctx.save()
  roundRect(ctx, px, py, pw, ph, 16); ctx.clip()
  ctx.fillStyle = '#0d0a00'; ctx.fillRect(px, py, pw, ph)
  if (photo) placePhoto(ctx, photo, px, py, pw, ph, null)
  ctx.restore()
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3
  roundRect(ctx, px, py, pw, ph, 16); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1
  roundRect(ctx, px - 5, py - 5, pw + 10, ph + 10, 20); ctx.stroke()

  // Photo fade
  const fade = ctx.createLinearGradient(0, py + ph * 0.55, 0, py + ph)
  fade.addColorStop(0, 'rgba(5,5,0,0)'); fade.addColorStop(1, 'rgba(5,5,0,1)')
  ctx.fillStyle = fade; ctx.fillRect(px, py + ph * 0.55, pw, ph * 0.45)

  // LENDA badge
  ctx.fillStyle = '#FFD700'; ctx.textAlign = 'center'
  ctx.font = `bold 13px 'Rajdhani', sans-serif`
  const bx = W / 2, by = py + ph - 8
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  roundRect(ctx, bx - 40, by - 20, 80, 24, 4); ctx.fill()
  ctx.fillStyle = '#FFD700'
  ctx.fillText('★  L E N D A  ★', bx, by - 3)
  ctx.restore()

  const sepY = py + ph + 14
  // Sep
  const sg = ctx.createLinearGradient(18, 0, W - 18, 0)
  sg.addColorStop(0, 'rgba(255,215,0,0)'); sg.addColorStop(0.5, '#FFD700'); sg.addColorStop(1, 'rgba(255,215,0,0)')
  ctx.fillStyle = sg; ctx.fillRect(18, sepY, W - 36, 1.5)

  // Name
  ctx.font = `bold 40px 'Bebas Neue', sans-serif`
  const ng2 = ctx.createLinearGradient(0, 0, W, 0)
  ng2.addColorStop(0, '#FFF9E6'); ng2.addColorStop(0.5, '#FFD700'); ng2.addColorStop(1, '#FFF9E6')
  ctx.fillStyle = ng2
  ctx.shadowColor = 'rgba(255,215,0,0.5)'; ctx.shadowBlur = 10
  ctx.fillText(name.toUpperCase().slice(0, 15), W / 2, sepY + 40)
  ctx.shadowBlur = 0

  // Pos + country
  ctx.font = `600 16px 'Rajdhani', sans-serif`
  ctx.fillStyle = 'rgba(255,215,0,0.7)'
  ctx.fillText(`${POSITIONS[rand(0, POSITIONS.length - 1)]}  ·  ${COUNTRY_CODES[country] || 'BRA'}`, W / 2, sepY + 60)

  // Stats
  const stY = sepY + 78, stW = (W - 36) / 3
  Object.entries(stats).forEach(([k, v], i) => {
    const row = Math.floor(i / 3), col = i % 3
    const x = 18 + col * stW + stW / 2, y = stY + row * 42
    ctx.font = `bold 25px 'Rajdhani', sans-serif`; ctx.fillStyle = '#FFF'; ctx.fillText(v, x, y)
    ctx.font = `600 11px 'Rajdhani', sans-serif`; ctx.fillStyle = 'rgba(255,215,0,0.7)'; ctx.fillText(k, x, y + 14)
  })
  ctx.textAlign = 'left'
}

async function drawRetro(ctx, W, H, photo, name, country, overall, stats) {
  // Aged cream
  ctx.fillStyle = '#F2E6C8'; ctx.fillRect(0, 0, W, H)

  // Noise texture
  for (let i = 0; i < 4000; i++) {
    const nx = rand(0, W), ny = rand(0, H)
    ctx.fillStyle = `rgba(${rand(80, 120)},${rand(60,100)},${rand(20,50)},${Math.random() * 0.06})`
    ctx.fillRect(nx, ny, 1, 1)
  }

  // Border
  ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 8
  ctx.strokeRect(4, 4, W - 8, H - 8)
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 3
  ctx.strokeRect(12, 12, W - 24, H - 24)
  ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 1
  ctx.strokeRect(18, 18, W - 36, H - 36)

  // Corner diamonds
  [[22, 22], [W - 22, 22], [22, H - 22], [W - 22, H - 22]].forEach(([dx, dy]) => {
    ctx.fillStyle = '#D4A017'; ctx.save(); ctx.translate(dx, dy); ctx.rotate(Math.PI / 4)
    ctx.fillRect(-6, -6, 12, 12); ctx.restore()
  })

  // Header banner
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(0, 0, W, 55)
  ctx.font = `bold 26px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#F2E6C8'; ctx.textAlign = 'center'
  ctx.fillText('COPA DO MUNDO', W / 2, 36)
  ctx.textAlign = 'left'

  // Year badge
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.arc(W - 38, 80, 26, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(W - 38, 80, 26, 0, Math.PI * 2); ctx.stroke()
  ctx.font = `bold 16px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#4A2800'; ctx.textAlign = 'center'
  ctx.fillText(overall, W - 38, 86)
  ctx.textAlign = 'left'

  // Photo (sepia-tinted via overlay)
  const pw = W * 0.7, ph = pw * 1.05
  const ppx = (W - pw) / 2, ppy = 70
  ctx.save()
  roundRect(ctx, ppx, ppy, pw, ph, 5); ctx.clip()
  ctx.fillStyle = '#B8956A'; ctx.fillRect(ppx, ppy, pw, ph)
  if (photo) {
    placePhoto(ctx, photo, ppx, ppy, pw, ph, null)
    // Sepia overlay
    ctx.fillStyle = 'rgba(139,69,19,0.35)'
    ctx.fillRect(ppx, ppy, pw, ph)
  }
  ctx.restore()
  ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3
  roundRect(ctx, ppx, ppy, pw, ph, 5); ctx.stroke()

  const sepY = ppy + ph + 18
  ctx.fillStyle = '#8B4513'; ctx.fillRect(22, sepY, W - 44, 2)
  ctx.fillStyle = '#D4A017'; ctx.fillRect(22, sepY + 4, W - 44, 1)

  ctx.font = `bold 36px 'Bebas Neue', sans-serif`
  ctx.fillStyle = '#3A1F00'; ctx.textAlign = 'center'
  ctx.fillText(name.toUpperCase().slice(0, 15), W / 2, sepY + 42)

  ctx.font = `700 15px 'Rajdhani', sans-serif`
  ctx.fillStyle = '#8B4513'
  ctx.fillText(`${POSITIONS[rand(0, POSITIONS.length - 1)]}  ·  ${COUNTRY_CODES[country] || 'BRA'}`, W / 2, sepY + 62)

  const stY = sepY + 80, stW = (W - 36) / 3
  Object.entries(stats).forEach(([k, v], i) => {
    const row = Math.floor(i / 3), col = i % 3
    const x = 18 + col * stW + stW / 2, y = stY + row * 42
    ctx.font = `bold 24px 'Rajdhani', sans-serif`; ctx.fillStyle = '#3A1F00'; ctx.fillText(v, x, y)
    ctx.font = `600 11px 'Rajdhani', sans-serif`; ctx.fillStyle = '#8B4513'; ctx.fillText(k, x, y + 14)
  })
  ctx.textAlign = 'left'

  // "PANINI style" watermark
  ctx.font = `italic 10px 'Rajdhani', sans-serif`; ctx.fillStyle = 'rgba(139,69,19,0.35)'
  ctx.textAlign = 'center'; ctx.fillText('MINHA FIGURINHA DA COPA', W / 2, H - 10)
  ctx.textAlign = 'left'
}

export const CARD_STYLES = {
  fut: { id: 'fut', name: 'FIFA Ultimate Team', desc: 'O card mais icônico do futebol', gradient: 'linear-gradient(135deg,#4a1a00,#FFD700 60%,#1e0800)', accent: '#FFD700' },
  neon: { id: 'neon', name: 'Neon Premium', desc: 'Futurista e ultralimitado', gradient: 'linear-gradient(135deg,#030310,#00FF87 60%,#0099FF)', accent: '#00FF87' },
  panini: { id: 'panini', name: 'Clássica Panini', desc: 'O clássico que nunca sai de moda', gradient: 'linear-gradient(135deg,#009C3B,#FFDF00 60%,#009C3B)', accent: '#FFDF00' },
  legendary: { id: 'legendary', name: 'Lendária', desc: 'Para os imortais do futebol', gradient: 'linear-gradient(135deg,#050500,#FFD700 50%,#8B6914)', accent: '#FFD700' },
  retro: { id: 'retro', name: 'Copa Retrô', desc: 'Viagem ao passado dourado', gradient: 'linear-gradient(135deg,#8B4513,#F2E6C8 60%,#D4A017)', accent: '#D4A017' },
}

export async function generateCard(canvas, photoImg, styleId, name, country) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const overall = computeOverall(name)
  const stats = generateStats()

  ctx.clearRect(0, 0, W, H)

  switch (styleId) {
    case 'fut': await drawFUT(ctx, W, H, photoImg, name, country, overall, stats); break
    case 'neon': await drawNeon(ctx, W, H, photoImg, name, country, overall, stats); break
    case 'panini': await drawPanini(ctx, W, H, photoImg, name, country, overall, stats); break
    case 'legendary': await drawLegendary(ctx, W, H, photoImg, name, country, overall, stats); break
    case 'retro': await drawRetro(ctx, W, H, photoImg, name, country, overall, stats); break
    default: await drawFUT(ctx, W, H, photoImg, name, country, overall, stats)
  }

  return { dataUrl: canvas.toDataURL('image/png'), overall, stats }
}

export function drawMiniCard(canvas, styleId) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const style = CARD_STYLES[styleId] || CARD_STYLES.fut

  const grad = ctx.createLinearGradient(0, 0, W, H)
  const [c1, c2, c3] = [style.accent + '33', style.accent + '88', style.accent + '22']
  grad.addColorStop(0, '#111'); grad.addColorStop(0.5, c2); grad.addColorStop(1, '#000')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

  // border
  ctx.strokeStyle = style.accent; ctx.lineWidth = 2
  roundRect(ctx, 2, 2, W - 4, H - 4, 6); ctx.stroke()

  // avatar circle
  const ac = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, W * 0.28)
  ac.addColorStop(0, style.accent + '44'); ac.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ac; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = style.accent + '88'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(W / 2, H * 0.38, W * 0.24, 0, Math.PI * 2); ctx.stroke()

  // silhouette
  ctx.fillStyle = style.accent + '55'
  ctx.beginPath(); ctx.arc(W / 2, H * 0.3, W * 0.12, 0, Math.PI * 2); ctx.fill()
  ctx.fillRect(W / 2 - W * 0.15, H * 0.4, W * 0.3, H * 0.18)

  // name bar
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(4, H * 0.68, W - 8, H * 0.2)
  ctx.fillStyle = '#fff'; ctx.font = `bold ${W * 0.11}px 'Bebas Neue',sans-serif`
  ctx.textAlign = 'center'; ctx.fillText('CRAQUE', W / 2, H * 0.81)

  // rating
  ctx.font = `bold ${W * 0.18}px 'Bebas Neue',sans-serif`
  ctx.fillStyle = style.accent
  ctx.fillText('99', W / 2, H * 0.57)
  ctx.textAlign = 'left'
}
