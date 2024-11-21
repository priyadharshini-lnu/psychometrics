import React from 'react'
import { Tooltip } from 'antd'
import styles from './styles.less'

type Props = {
  title: string,
  lines?: number,
  id?: string
}

export const TruncatedTitle: React.FC<Props> = ({ title, lines = 2, id }) => (
  <Tooltip title={title}>
    <div id={id} className={styles.title} style={{ WebkitLineClamp: lines }}>{title}</div>
  </Tooltip>
)
