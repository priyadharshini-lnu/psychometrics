import _ from 'lodash'
import Foundation from '~/modules/reports/components/Foundation'
import styles from './Shape.less'
import {
  joinStyles, useAssignStyle, convertColor, gradientStyle, borderRadiusStyle,
} from '../../CommonMethods/styles'

const assignStyle = useAssignStyle('Shape')

const buildeStyles = (styles, overrides) => {
  let style = styles
  let outerStyle = {}
  const {
    backgroundColor, borderColor, borderRadius, shadow, offsetX, offsetY,
  } = overrides

  const br = assignStyle(style, 'borderRadius', borderRadius)
  const borderCorners = borderRadiusStyle(style, br)

  if (!style.border && !borderColor) {
    style = _.omit(style, ['border', 'borderColor', 'borderWidth', 'borderStyle'])
  }

  style.borderColor = assignStyle(style, 'borderColor', convertColor(borderColor))
  style.backgroundColor = assignStyle(style, 'backgroundColor', convertColor(backgroundColor))
  style = _.omit(style, 'border', 'borderRadius')
  outerStyle = _.omit(outerStyle, 'border', 'borderRadius')

  if (!_.isNil(borderRadius)) {
    style.borderRadius = `${borderRadius}px`
    outerStyle.borderRadius = `${borderRadius}px`
  } else {
    Object.assign(style, borderCorners)
    Object.assign(outerStyle, borderCorners)
  }

  if (borderColor && !style.borderWidth) {
    style.border = `1px solid ${convertColor(borderColor)}`
  }


  if (style.boxShadow?.enabled || shadow) {
    const {
      x = offsetX, y = offsetY, blur = shadow, spread = 0, color = '#000000',
    } = (style.boxShadow || {})
    // eslint-disable-next-line max-len
    outerStyle.boxShadow = `${offsetX || x || 0}px ${offsetY || y || 0}px ${shadow || blur || 0}px ${spread || 0}px ${color}`
  }

  if (!backgroundColor && style.gradient?.enabled) {
    const gradient = gradientStyle(style.gradient)
    if (gradient) { style.backgroundImage = gradient }
  }
  style = _.omit(style, ['boxShadow', 'gradient'])

  return [style, outerStyle]
}

const Shape = (props) => {
  const { module, reportStyles } = props

  let [style, outerStyle] = buildeStyles(joinStyles(reportStyles, module.props.styleIds), module.props.style)

  if (module.textConditions.length > 0) {
    const styles = module.getStylesByCondition()
    if (styles) {
      [style, outerStyle] = buildeStyles(
        joinStyles(reportStyles, styles.styleIds), { ...module.props.style, ...styles },
      )
    }
  }

  return (
    <Foundation {...props} outerStyle={outerStyle}>
      <div className={styles.shape} style={style} />
    </Foundation>
  )
}

export default Shape
