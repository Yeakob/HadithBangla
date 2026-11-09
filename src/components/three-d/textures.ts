import * as THREE from 'three'

/** All textures are drawn procedurally on canvas: no external image downloads. */
function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function tex(c: HTMLCanvasElement, repeat = 1) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat !== 1) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat, repeat)
  }
  return t
}

/** 8-point star (two overlapping squares) path. */
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.72
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.closePath()
}

function rosette(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  for (let k = 0; k < 4; k++) {
    ctx.lineWidth = k === 0 ? 3 : 1.4
    star(ctx, x, y, r * (1 - k * 0.2))
    ctx.stroke()
  }
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25)
    ctx.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95)
    ctx.lineWidth = 0.8
    ctx.stroke()
  }
  ctx.restore()
}

/** Illuminated manuscript page. `side` picks the decoration; text is decorative calligraphy only. */
export function pageTexture(side: 'left' | 'right') {
  const W = 768, H = 1024
  const [c, ctx] = canvas(W, H)
  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 700)
  g.addColorStop(0, '#f7eed7')
  g.addColorStop(1, '#e3d1a6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // paper fibre noise
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(120,90,40,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5)
  }
  const gold = '#b48a3c'
  ctx.strokeStyle = gold
  ctx.lineWidth = 6
  ctx.strokeRect(46, 46, W - 92, H - 92)
  ctx.lineWidth = 1.5
  ctx.strokeRect(62, 62, W - 124, H - 124)
  // border band of small stars
  for (let x = 90; x < W - 70; x += 44) {
    star(ctx, x, 54, 8); ctx.stroke()
    star(ctx, x, H - 54, 8); ctx.stroke()
  }
  for (let y = 98; y < H - 70; y += 44) {
    star(ctx, 54, y, 8); ctx.stroke()
    star(ctx, W - 54, y, 8); ctx.stroke()
  }
  ;[[110, 110], [W - 110, 110], [110, H - 110], [W - 110, H - 110]].forEach(([x, y]) => rosette(ctx, x, y, 34, gold))
  if (side === 'right') {
    rosette(ctx, W / 2, H / 2, 230, gold)
    ctx.fillStyle = 'rgba(6,61,50,.9)'
    star(ctx, W / 2, H / 2, 70)
    ctx.fill()
    ctx.fillStyle = '#d9b46a'
    star(ctx, W / 2, H / 2, 40)
    ctx.fill()
  } else {
    // decorative calligraphy: the word "al-Hadith" (a title, not a hadith text)
    ctx.fillStyle = '#063d32'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 150px Amiri, "Noto Naskh Arabic", serif'
    ctx.fillText('الحديث', W / 2, H / 2 - 60)
    ctx.fillStyle = gold
    ctx.font = '400 64px Amiri, "Noto Naskh Arabic", serif'
    ctx.fillText('النبوي', W / 2, H / 2 + 80)
    // ruled lines suggesting text, kept abstract on purpose
    ctx.strokeStyle = 'rgba(80,60,30,.25)'
    ctx.lineWidth = 2
    for (let y = 640; y < 900; y += 34) {
      ctx.beginPath()
      ctx.moveTo(140, y)
      ctx.lineTo(W - 140, y)
      ctx.stroke()
    }
    rosette(ctx, W / 2, 230, 60, gold)
  }
  return tex(c)
}

export function woodTexture() {
  const [c, ctx] = canvas(512, 512)
  ctx.fillStyle = '#5a3219'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 160; i++) {
    const y = Math.random() * 512
    ctx.strokeStyle = `rgba(${30 + Math.random() * 40},${15 + Math.random() * 20},5,${0.15 + Math.random() * 0.3})`
    ctx.lineWidth = 0.6 + Math.random() * 2.4
    ctx.beginPath()
    for (let x = 0; x <= 512; x += 16) ctx.lineTo(x, y + Math.sin(x / 40 + i) * 4 + Math.sin(x / 9) * 1.2)
    ctx.stroke()
  }
  return tex(c)
}

export function floorTexture() {
  const [c, ctx] = canvas(512, 512)
  ctx.fillStyle = '#0b2a24'
  ctx.fillRect(0, 0, 512, 512)
  ctx.strokeStyle = 'rgba(200,164,93,.22)'
  ctx.lineWidth = 2
  for (let x = 64; x < 512; x += 128) for (let y = 64; y < 512; y += 128) { star(ctx, x, y, 52); ctx.stroke() }
  ctx.strokeStyle = 'rgba(0,0,0,.35)'
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke()
  }
  return tex(c, 6)
}

/** Soft vertical gradient used for sunbeams. */
export function rayTexture() {
  const [c, ctx] = canvas(64, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(255,226,170,0.9)')
  g.addColorStop(0.6, 'rgba(255,214,150,0.25)')
  g.addColorStop(1, 'rgba(255,214,150,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 256)
  const h = ctx.createLinearGradient(0, 0, 64, 0)
  h.addColorStop(0, 'rgba(0,0,0,1)')
  h.addColorStop(0.5, 'rgba(0,0,0,0)')
  h.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = h
  ctx.fillRect(0, 0, 64, 256)
  return tex(c)
}

export function dotTexture() {
  const [c, ctx] = canvas(64, 64)
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,240,200,1)')
  g.addColorStop(1, 'rgba(255,240,200,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return tex(c)
}

export function skyTexture() {
  const [c, ctx] = canvas(256, 256)
  const g = ctx.createRadialGradient(128, 70, 10, 128, 120, 220)
  g.addColorStop(0, '#fff3d6')
  g.addColorStop(0.45, '#f0c98a')
  g.addColorStop(1, '#7a5a2c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return tex(c)
}
