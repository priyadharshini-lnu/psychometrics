import React from 'react'
import { PageHeader, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

import { useHistory } from 'react-router-dom'
import styles from './styles.less'

const { Title } = Typography

export const InsightsHeader = () => {
  const history = useHistory()

  const handleNavigation = () => {
    history.push('/dashboard')
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
