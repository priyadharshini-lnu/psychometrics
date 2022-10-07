import React from 'react'
import { PageHeader, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

import styles from './styles.less'

const { Title } = Typography

export const InsightsHeader = () => {
  const handleNavigation = () => {
    /* */
  }

  const titleElement = <Title className={styles.headerTitle} level={4}>Insights</Title>
  return (
    <PageHeader
      className={styles.insightsHeader}
      onBack={handleNavigation}
      backIcon={<ArrowLeftOutlined className={styles.backIcon} />}
      ghost={false}
      title={titleElement}
    />
  )
}
