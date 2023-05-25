import React from 'react'
import cs from 'classnames'
import { RgbaColor } from 'react-colorful'
import { rgba2hex } from '~/utils/color'
import styles from './styles.less'

interface Props {
  percent: number
  className: string
  text: string
  progressColor?: string
  backgroundColor?: RgbaColor
}

const strokeWidth = 10
const size = 100

const PieGraph: React.FC<Props> = ({
  percent = 25,
  text = percent.toString(),
  className,
  progressColor,
  backgroundColor,
}) => {
  const radius = (size - strokeWidth) / 2
  const innerRadius = radius - (strokeWidth * 1.2)
  const viewBox = '0 0 100 100'
  const dashArray = radius * Math.PI * 2
  const dashOffset = dashArray - dashArray * percent / 100

  return (
    <div className={cs(styles.pieGraph, className)}>
      <svg
        viewBox={viewBox}
      >
        <circle
          className={styles.circleBackground}
          cx={50}
          cy={50}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          style={{
            stroke: (typeof backgroundColor === 'object') ? rgba2hex(backgroundColor) : backgroundColor,
          }}
        />
        <circle
          className={styles.circleProgress}
          cx={50}
          cy={50}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          // Start progress marker at 12 O'Clock
          transform="rotate(-90 50 50)"
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            stroke: progressColor ?? '#51d0d4',
          }}
        />
        <circle
          className={styles.textContainer}
          cx={50}
          cy={50}
          r={innerRadius}
          strokeWidth="0"
        />
        <text
          className={styles.circleText}
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </div>
  )
}

export default PieGraph
