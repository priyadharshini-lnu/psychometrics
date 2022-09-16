import React, { FC } from 'react'
import { Typography } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import styles from './TimerText.less'

type Props = {
  text: string
}
const { Text } = Typography

export const TimerText:FC<Props> = ({ text }) => (
  <>
    <ClockCircleOutlined className={styles.timerIcon} />
    <Text type="secondary">{text}</Text>
  </>
)
