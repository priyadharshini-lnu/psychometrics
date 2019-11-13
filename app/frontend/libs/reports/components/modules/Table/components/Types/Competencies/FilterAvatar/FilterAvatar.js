import React from 'react'
import styles from './styles.scss'

export default function FilterAvatar ({ filter, fontSize, showLabel }) {
  const fontSizeStr = `${fontSize}px`
  const heightStr = `${fontSize * 2}px`
  const style = {
    backgroundColor: filter.color,
    fontSize: fontSizeStr,
    height: heightStr,
    width: heightStr,
    lineHeight: heightStr,
  }
  if (!showLabel) {
    style.color = '#ffffff00'
  }
  return (
    <div
      className={styles.avatar}
      style={style}
    >
      {filter.avatarLetters}
    </div>
  )
}
