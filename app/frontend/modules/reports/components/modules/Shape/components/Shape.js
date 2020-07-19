import React from 'react'
import Foundation from 'rb/components/Foundation'
import styles from './Shape.scss'

const Text = (props) => {
  const { module } = props
  const {
    backgroundColor, borderColor, borderRadius, shadow, offsetX, offsetY,
  } = module.props.style

  const style = {
    backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
    border: '1px solid',
    borderRadius,
    borderColor: `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`,
  }

  const outerStyle = {
    borderRadius,
    boxShadow: `${offsetX}px ${offsetY}px ${shadow}px`,
  }

  if (module.textConditions.length > 0) {
    const {
      backgroundColor, borderColor,
    } = module.getStylesByCondition()
    if (backgroundColor) {
      // eslint-disable-next-line max-len
      style.backgroundColor = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`
    }
    if (borderColor) style.borderColor = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`
  }

  return (
    <Foundation {...props} outerStyle={outerStyle}>
      <div className={styles.shape} style={style} />
    </Foundation>
  )
}

export default Text
