import type { CountdownProps } from 'antd'
import {
  Flex, Progress, Typography, Statistic,
} from 'antd'

import { useEffect, useState } from 'react'
import styles from '../styles.less'

const { Countdown } = Statistic

export type ProgressWithCountdownProps = {
    percent: number;
    label?: string;
    strokeColor?: string;
    countdownProps?: CountdownProps & {
      totalDuration: string; // seconds
    };
    width?: number | string;
  }

const ProgressWithCountdown: React.FC<ProgressWithCountdownProps> = ({
  percent,
  label,
  strokeColor = '#E89F0F',
  countdownProps,
  width = 500,
}) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(percent)
  }, [percent])

  return (
    <Flex vertical className={styles.container} style={{ width }}>
      <Flex vertical align="center" className={styles.progressCtr}>
        <Progress
          strokeColor={strokeColor}
          className={styles.progress}
          strokeWidth={4}
          percent={progress}
          showInfo={false}
        />
        <Flex gap={2} justify="space-between">
          <Typography.Text>{label}</Typography.Text>
          {countdownProps && (
            <Typography.Text strong>
              <Flex>
                <Countdown
                  value={countdownProps.value}
                  format={countdownProps.format}
                  onFinish={countdownProps.onFinish}
                  className={styles.countdown}
                  onChange={countdownProps.onChange}
                />
                {`/${countdownProps.totalDuration}`}
              </Flex>
            </Typography.Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}


export default ProgressWithCountdown
