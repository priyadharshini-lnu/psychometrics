import React from 'react'
import { Progress as AntProgress } from 'antd'
import styles from './Progress.less'

interface Props {
  percent: number
  title: string
}
const MAX = 100

export const Progress: React.FC<Props> = ({ percent, title }) => (
  <>
    <div className={styles.titleContainer}>
      <div className={styles.title}>{title}</div>
      <div className={styles.percent}>
        {percent > MAX ? MAX : percent}
        %
      </div>
    </div>
    <AntProgress percent={percent} showInfo={false} />
  </>
)
