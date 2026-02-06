import { FC, ReactNode } from 'react'
import { Progress, theme, Space } from 'antd'

import styles from './ProgressBarWithCutoff.less'

const { useToken } = theme

type CustomProgressBarProps = {
  percent: number
  title: ReactNode| string
  cutoffPercent: number
}

export const ProgressBarWithCutoff: FC<CustomProgressBarProps> = ({ percent, title, cutoffPercent }) => {
  const { token } = useToken()
  return (
    <Space size={0} className="w-100" orientation="vertical">
      {title}
      <div className={styles.progressContainer}>
        <Progress
          strokeWidth={9}
          strokeLinecap="square"
          percent={percent}
          trailColor={token.colorPrimaryBg}
          strokeColor={token.colorPrimary}
          showInfo={false}
        />
        <CutoffLine cutoffPercent={cutoffPercent} />
      </div>
    </Space>

  )
}

const CutoffLine: FC<Pick<CustomProgressBarProps, 'cutoffPercent'>> = ({ cutoffPercent }) => (
  <div style={{ left: `${cutoffPercent}%` }} className={styles.cutoff} />
)
