// Adapted from https://marcodiiga.github.io/rgba-to-rgb-conversion
// assuming hex color codes without the leading #
function RGBAtoRGB (foregroundColor: string, backgroundColor: string) {
  const foregroundColorRgba = {
    r: HexToDec(foregroundColor.substr(0, 2) || '00'),
    g: HexToDec(foregroundColor.substr(2, 2) || '00'),
    b: HexToDec(foregroundColor.substr(4, 2) || '00'),
    a: HexToDec(foregroundColor.substr(6, 2) || 'FF') / 255,
  }
  const backgroundColorRgba = {
    r: HexToDec(backgroundColor.substr(0, 2) || '00'),
    g: HexToDec(backgroundColor.substr(2, 2) || '00'),
    b: HexToDec(backgroundColor.substr(4, 2) || '00'),
  }
  let { a } = foregroundColorRgba
  if (isNaN(a)) a = 1
  const modR = Math.round((1 - a) * backgroundColorRgba.r + a * foregroundColorRgba.r)
  const modG = Math.round((1 - a) * backgroundColorRgba.g + a * foregroundColorRgba.g)
  const modB = Math.round((1 - a) * backgroundColorRgba.b + a * foregroundColorRgba.b)
  const modColor = (`0${modR.toString(16)}`).slice(-2)
    + (`0${modG.toString(16)}`).slice(-2) + (`0${modB.toString(16)}`).slice(-2)
  return modColor
}

function HexToDec (hexCode: string): number {
  if (RegExp(/^[a-f|0-9]+$/i).test(hexCode)) {
    return parseInt(hexCode, 16)
  }
  return 0
}

function getsRGB (c) {
  c = HexToDec(c) / 255
  c = (c <= 0.03928) ? c / 12.92 : (((c + 0.055) / 1.055) ** 2.4)
  return c
}

function getLuminance (color: string) {
  return (0.2126 * getsRGB(color.substr(0, 2))
    + 0.7152 * getsRGB(color.substr(2, 2)) + 0.0722 * getsRGB(color.substr(4, 2)))
}

type ContrastResult ={
  ratio: number
  isAccessible: boolean
}

export function getContrastRatio (foregroundColor: string, backgroundColor: string):ContrastResult {
  // eslint-disable-next-line max-len
  // modified color is the color you get when you put first color on top of second color and take into account the alpha value of first color
  const modifiedForegroundColor = RGBAtoRGB(foregroundColor, backgroundColor)
  const modifiedBackgroundColor = RGBAtoRGB(backgroundColor, foregroundColor)
  const foregroundLuminance = getLuminance(modifiedForegroundColor)
  const backgroundLuminance = getLuminance(modifiedBackgroundColor)
  const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  const roundedRatio = Math.round(ratio * 100) / 100
  return { ratio: roundedRatio, isAccessible: ratio >= 4.5 }
}
