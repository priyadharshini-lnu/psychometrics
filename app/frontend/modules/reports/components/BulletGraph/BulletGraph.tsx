import React from 'react'
import cs from 'classnames'
import { RgbaColor } from 'react-colorful'
import _ from 'lodash'
import { Flex } from 'antd'
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
  scorePercentage: number
  lineColor?: string
  bulletColor?: string
  showScoreText?: boolean
  score?: number
  scoreBulletGraphHeight?: number
  scoreStyle?: React.CSSProperties
}

const BulletGraph: React.FC<Props> = ({
  scoreRanges, baselineScore, scorePercentage, score, lineColor, bulletColor, showScoreText, scoreBulletGraphHeight,
  scoreStyle,
}) => {
  const max = _.maxBy(scoreRanges, x => x.value)
  const min = _.minBy(scoreRanges, x => x.value)

  if (max === undefined || min === undefined || max.value <= min.value || !scorePercentage) return null
  const percWidth = (value: number) => (value * 100) / (max.value - min.value)

  const baselineScorePercentage = Utils.scaleNumber(baselineScore, min.value, max.value, 0, 100)
  return (
    <Flex className="w-100 mb-1" gap={8} justify="center" align="center">
      <div className={cs(styles.bulletGraph, 'w-100')}>
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
            width: `${scorePercentage}%`,
            maxWidth: '100%',
            height: `${scoreBulletGraphHeight}%` || '30%',
            backgroundColor: lineColor,
          }}
        />
        {baselineScore ? (
          <div
            className={styles.baselineScore}
            style={{
              left: `${baselineScorePercentage}%`,
              backgroundColor: bulletColor,
            }}
          />
        ) : null}
      </div>
      {showScoreText && (
        <div style={scoreStyle} className={styles.scoreText}>
          {score}
        </div>
      )}
    </Flex>
  )
}

export default BulletGraph
