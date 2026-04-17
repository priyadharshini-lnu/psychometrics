export function convertSpeedToMbps (speed: string): number {
  const speedRegex = /^([\d.]+)\s*(kbps|mbps|gbps)$/i
  const match = speed.match(speedRegex)

  const value = parseFloat(match![1])
  const unit = match![2].toLowerCase()

  switch (unit) {
    case 'kbps':
      return value / 1024
    case 'mbps':
      return value
    case 'gbps':
      return value * 1024
    default:
      throw new Error(`Unsupported unit: ${unit}`)
  }
}
