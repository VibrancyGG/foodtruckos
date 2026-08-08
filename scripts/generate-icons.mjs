import sharp from "sharp"
import { mkdirSync } from "fs"

mkdirSync("public/icons", { recursive: true })

const ink = "#0B0B0B"

function iconSvg({ size, padding = 0 }) {
  const inner = size - padding * 2
  const radius = size * 0.22
  const fontSize = inner * 0.56
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${padding > 0 ? ink : "none"}"/>
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${radius}" fill="${ink}"/>
  <text x="50%" y="${padding + inner / 2}" dy="${fontSize * 0.36}" text-anchor="middle"
    font-family="Arial, sans-serif" font-weight="900" font-size="${fontSize}" fill="#ffffff">F</text>
</svg>`
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  { name: "icon-maskable-512.png", size: 512, padding: 64 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
]

for (const t of targets) {
  await sharp(Buffer.from(iconSvg(t)))
    .png()
    .toFile(`public/icons/${t.name}`)
  console.log("wrote", t.name)
}
