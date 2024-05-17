import _ from 'lodash'
import Foundation from '~/modules/reports/components/Foundation'
import styles from './Shape.less'
import { joinStyles, useAssignStyle, convertColor } from '../../CommonMethods/styles'

const assignStyle = useAssignStyle('Shape')

const Shape = (props) => {
  const { module, reportStyles } = props
  const {
    backgroundColor, borderColor, borderRadius, shadow, offsetX, offsetY,
  } = module.props.style

  let style = joinStyles(reportStyles, module.props.styleIds)
  const outerStyle = {}

  style.borderRadius = assignStyle(style, 'borderRadius', borderRadius)

  if (!style.border && !module.props.style.borderColor) {
    style = _.omit(style, ['border', 'borderColor', 'borderWidth', 'borderStyle'])
  }

  style.borderColor = assignStyle(style, 'borderColor', convertColor(borderColor))
  style.backgroundColor = assignStyle(style, 'backgroundColor', convertColor(backgroundColor)) || '#cccccc'
  style = _.omit(style, 'border')

  if (borderColor && !style.borderWidth) {
    style.border = `1px solid ${convertColor(borderColor)}`
  }

  outerStyle.borderRadius = style.borderRadius || borderRadius

  if (style.boxShadow?.enabled) {
    const {
      x = offsetX, y = offsetY, blur = shadow, spread = 0, color = '#000000',
    } = style.boxShadow
    // eslint-disable-next-line max-len
    outerStyle.boxShadow = `${offsetX || x || 0}px ${offsetY || y || 0}px ${shadow || blur || 0}px ${spread || 0}px ${color}`
  }

  style = _.omit(style, ['boxShadow'])

  if (module.textConditions.length > 0) {
    const {
      backgroundColor, borderColor,
    } = module.getStylesByCondition()
    if (backgroundColor) {
      // eslint-disable-next-line max-len
      style.backgroundColor = convertColor(backgroundColor)
    }
    if (borderColor) style.borderColor = convertColor(borderColor)
  }

  return (
    <Foundation {...props} outerStyle={outerStyle}>
      <div className={styles.shape} style={style} />
    </Foundation>
  )
}

export default Shape
