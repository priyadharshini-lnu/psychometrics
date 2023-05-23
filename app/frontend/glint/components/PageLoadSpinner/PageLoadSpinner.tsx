import { FC } from 'react'
import { Spin, SpinProps } from 'antd'

import styles from './PageLoadSpinner.less'

export const PageLoadSpinner: FC<SpinProps> = props => (
  <div className={styles.spinLoader}>
    <Spin {...props} />
  </div>
)
