import { RgbaColor } from 'react-colorful'

export const rgba2hex = (rgba: { r: number|string, g: number|string, b: number|string, a?: number|string }) => {
  const hex = (val: number|string) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    const nonNullNum = isNaN(num) ? 0 : num
    return nonNullNum.toString(16).toUpperCase().padStart(2, '0')
  }
  const alpha = (typeof rgba.a === 'number') ? rgba.a : 1
  return `#${hex(rgba.r)}${hex(rgba.g)}${hex(rgba.b)}${alpha < 1 ? (hex(Math.round(alpha * 255))) : ''}`
}
const round = (number: number, digits = 0, base = 10 ** digits): number => Math.round(base * number) / base
export const hexToRgba = (hex: string): RgbaColor => {
  if (hex[0] === '#') hex = hex.substring(1)

  if (hex.length < 6) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: hex.length === 4 ? round(parseInt(hex[3] + hex[3], 16) / 255, 2) : 1,
    }
  }

  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
    a: hex.length === 8 ? round(parseInt(hex.substring(6, 8), 16) / 255, 2) : 1,
  }
}

// antd's palette generator desaturates very dark seeds (e.g. the Marsh navy #061047) into
// grays when it produces light shades. Blending the seed straight toward white keeps its hue
// at any brightness, so brand-derived surfaces stay on-brand whatever primary a project sets.
export const tintTowardWhite = (hex: string, whiteRatio: number): string => {
  const { r, g, b } = hexToRgba(hex)
  const blend = (channel: number) => Math.round(channel + (255 - channel) * whiteRatio)
  return rgba2hex({ r: blend(r), g: blend(g), b: blend(b) })
}
