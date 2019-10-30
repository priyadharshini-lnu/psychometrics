/* eslint-disable max-len */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styles from './CircularProgress.scss'

export default function CircularProgress ({
  size, value, text, strokeSize = size * 0.09, circleStyle = {}, barStyle = {},
}) {
  const halfSize = size / 2
  const r = halfSize - strokeSize
  const c = Math.PI * (r * 2)
  value = _.clamp(value, 0, 100)
  const pct = ((100 - value) / 100) * c
  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle r={r} cx={halfSize} cy={halfSize} fill="transparent" strokeDasharray={c} strokeDashoffset="0" strokeWidth={strokeSize} strokeLinecap="round" style={circleStyle} />
        <circle transform={`rotate(-90 ${halfSize} ${halfSize})`} className={styles.bar} r={r} cx={halfSize} cy={halfSize} fill="transparent" strokeDasharray={c} strokeWidth={strokeSize} strokeLinecap="round" strokeDashoffset="0" style={{ strokeDashoffset: pct, ...barStyle }} />
      </svg>
      <div className={styles.textContainer} style={{ margin: strokeSize * 2.2 }}>
        <div className={styles.text} style={{ fontSize: size * 0.28 }}>{text || value}</div>
      </div>
    </div>
  )
}

CircularProgress.propTypes = {
  value: PropTypes.number.isRequired,
  text: PropTypes.string,
}
