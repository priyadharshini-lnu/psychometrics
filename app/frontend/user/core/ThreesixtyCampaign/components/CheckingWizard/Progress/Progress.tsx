import React from 'react'
import { Progress as AntProgress } from 'antd'
import styles from './styles.scss'

interface Props {
  percent: number
  title: string
}

const Progress: React.FC<Props> = ({ percent, title }) => (
  <>
    <div className={styles.titleContainer}>
      <div className={styles.title}>{title}</div>
      <div className={styles.percent}>
        {percent}
        %
      </div>
    </div>
    <AntProgress percent={percent} showInfo={false} />
  </>
)

export default Progress
