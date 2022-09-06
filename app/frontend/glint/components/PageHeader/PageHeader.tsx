import React from 'react'
import { Layout, Row } from 'antd'
import styles from './styles.less'

const { Header } = Layout

type PageHeaderProps = {
  children?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ children }) => (
  <Header className={styles.pageHeader}>
    <Row>{children}</Row>
  </Header>
)
