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
  const textStyles: Style[] = _.compact((styleIds || []).map(id => reportStyles[id]))

  return textStyles.reduce((styles, style) => ({ ...styles, ...style.styles }), {})
}
