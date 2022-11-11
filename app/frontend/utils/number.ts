
export const scaleNumber = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  if (value < inMin || value > inMax) {
    console.warn(`scale() value out of range: ${value}`)
    return 0
  }
  return (outMax - outMin) * (value - inMin) / (inMax - inMin) + outMin
}

export default {
  scaleNumber,
}
