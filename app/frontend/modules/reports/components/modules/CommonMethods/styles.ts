import _ from 'lodash'
import { rgba2hex } from '~/utils/color'
import DefaultProps from '~/modules/reports/consts/DefaultProps'
import { Style } from '~/modules/reports/core/interfaces/Report'

enum Types {
  Text = 'Text',
  Image = 'Image',
  Shape = 'Shape',
  Table = 'Table',
  Graph = 'Graph',
}

interface Point {
  position: number,
  color: string
}
interface Gradient {
  enabled: boolean
  type: 'linear' | 'radial'
  degree: number
  points: Point[]
}

export const isDefault = (moduleType = 'Text', style, val) => _.isEqual(
  DefaultProps[moduleType].style[style], val,
)

export const convertColor = (
  rgba: string | { r: number|string, g: number|string, b: number|string, a?: number|string },
) => {
  if (_.isObject(rgba)) {
    return rgba2hex(rgba)
  }
  return rgba
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAssignStyle = (type: Types) => (...args:[Style, string, any]) => assignStyle(type, ...args)

const isEmpty = val => val === undefined || val === null || val === ''

const assignStyle = (moduleType, style, styleName, value) => {
  if (isEmpty(value) || isDefault(moduleType, styleName, value)) {
    return style[styleName] || value
  }

  return value
}

export const joinStyles = (reportStyles, styleIds) => {
  const moduleStyles: Style[] = _.compact((styleIds || []).map(id => reportStyles[id]))

  return moduleStyles.reduce((styles, style) => ({ ...styles, ...style.styles }), {})
}


export const gradientStyle = (gradient: Gradient) => {
  if (!gradient?.enabled) { return }

  if (gradient.type === 'linear') {
    // eslint-disable-next-line max-len
    return `linear-gradient(${gradient.degree}deg, ${_.map(gradient.points, p => `${p.color} ${p.position}%`).join(', ')})`
  }

  if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${_.map(gradient.points, p => `${p.color} ${p.position}%`).join(', ')})`
  }

  return undefined
}

export const borderRadiusStyle = (style, defaultRadius = 0) => ({
  borderStartStartRadius: `${style.borderRadiusTopLeft ?? defaultRadius}px`,
  borderStartEndRadius: `${style.borderRadiusTopRight ?? defaultRadius}px`,
  borderEndEndRadius: `${style.borderRadiusBottomRight ?? defaultRadius}px`,
  borderEndStartRadius: `${style.borderRadiusBottomLeft ?? defaultRadius}px`,
})


export const stylesPreview = (styles) => {
  const bs = styles.boxShadow
  const boxShadow = bs?.enabled
    ? `${bs.x || 0}px ${bs.y || 0}px ${bs.blur || 0}px ${bs.spread || 0}px ${bs.color}`
    : undefined
  const gradient = gradientStyle(styles.gradient)


  return {
    ...styles, boxShadow, ...(gradient ? { backgroundImage: gradient } : {}), ...borderRadiusStyle(styles),
  }
}
