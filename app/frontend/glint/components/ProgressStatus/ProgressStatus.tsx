import React, { FC, HTMLAttributes, useContext } from 'react'
import { Col, Row, Typography } from 'antd'
import cs from 'classnames'

import { MediaQueryContext } from 'glint'
import styles from './styles.less'

const { Title, Text } = Typography

type ProgressStatusProps = {
  statusText: string
  StatusIcon: (props: HTMLAttributes<HTMLAnchorElement>) => React.ReactElement | null
  count: number
  theme?: 'light' | 'dark'
}

export const ProgressStatus: FC<ProgressStatusProps> = ({
  statusText, StatusIcon, count, theme = 'dark',
}) => {
  const { isMobile } = useContext(MediaQueryContext)

  return (
    <Row gutter={[16, 0]}>
      {!isMobile && (
      <Col span={6} className={cs(styles[theme], styles.iconColumn)}>
        <StatusIcon className={styles.statusIcon} />
      </Col>
      )}
      <Col>
        <Row>
          <Text className={styles[theme]}>{statusText}</Text>
        </Row>
        <Row>
          <Title level={5} className={cs(styles[theme], styles.statusCount)}>
            {count}
          </Title>
        </Row>
      </Col>
    </Row>
  )
}
