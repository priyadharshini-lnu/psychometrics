import React from 'react'
import cs from 'classnames'
import { RgbaColor } from 'react-colorful'
import _ from 'lodash'
import { rgba2hex } from '~/utils/color'
import Utils from '~/modules/reports/utils'
import styles from './styles.less'

interface ScoreRange {
  color: RgbaColor
  value: number
}

interface Props {
  scoreRanges: ScoreRange[]
  baselineScore: number
  score: number
  lineColor?: string
  bulletColor?: string
}

const BulletGraph: React.FC<Props> = ({
  scoreRanges, baselineScore, score, lineColor, bulletColor,
}) => {
  const max = _.maxBy(scoreRanges, x => x.value)
  const min = _.minBy(scoreRanges, x => x.value)

  if (max === undefined || min === undefined || max.value <= min.value || !score) return null
  const percWidth = (value: number) => (value * 100) / (max.value - min.value)

  const baselineScorePercentage = Utils.scaleNumber(baselineScore, min.value, max.value, 0, 100)
  return (
    <div className={cs(styles.bulletGraph)}>
      <div className={cs(styles.bands)}>
        {scoreRanges.map((scoreRange, i) => {
          if (i === scoreRanges.length - 1) return null
          const width = percWidth(scoreRanges[i + 1].value - scoreRange.value)
          const style = {
            display: 'block',
            width: `${width}%`,
            backgroundColor: scoreRange ? rgba2hex(scoreRange.color) : 'transparent',
          }
          return <div style={style} key={i} />
        })}
      </div>
      <div
        className={styles.score}
        style={{
          width: `${score}%`,
          maxWidth: '100%',
          backgroundColor: lineColor,
        }}
      />
      <div
        className={styles.baselineScore}
        style={{
          left: `${baselineScorePercentage}%`,
          backgroundColor: bulletColor,
        }}
      />
    </div>
  )
}

export default BulletGraph
