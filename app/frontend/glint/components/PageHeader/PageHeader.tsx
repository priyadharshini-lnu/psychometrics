import React from 'react'
import { Layout, Row } from 'antd'
import cs from 'classnames'
import styles from './styles.less'

const { Header } = Layout

type PageHeaderProps = {
  children?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ className, children }) => (
  <Header className={cs(styles.pageHeader, className)}>
    <Row className={styles.childrenRow} justify="center">{children}</Row>
  </Header>
)
