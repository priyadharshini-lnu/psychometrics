import React from 'react'
import { Tooltip } from 'antd'
import styles from './styles.less'

type Props = {
  title: string,
  lines?: number,
}

export const TruncatedTitle: React.FC<Props> = ({ title, lines = 2 }) => (
  <Tooltip title={title}>
    <div className={styles.title} style={{ WebkitLineClamp: lines }}>{title}</div>
  </Tooltip>
)
