
export const rgba2hex = (rgba: { r: number, g: number, b: number, a?: number }) => {
  const hex = (num: number) => num.toString(16).toUpperCase().padStart(2, '0')
  const alpha = rgba.a || 1
  return `#${hex(rgba.r)}${hex(rgba.g)}${hex(rgba.b)}${alpha < 1 ? (hex(Math.round(alpha * 255))) : ''}`
}
