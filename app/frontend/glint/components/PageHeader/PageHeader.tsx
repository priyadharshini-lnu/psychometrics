import React, { useContext } from 'react'
import { Layout, Row, Col } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, MenuOutlined } from '@ant-design/icons'
import { MediaQueryContext } from 'glint/components/GlintProvider'
import styles from './styles.less'

const { Header } = Layout

type PageHeaderProps = {
  collapsed: boolean
  visible: boolean
  setCollapsed: (visible: boolean) => void
  handleDrawer: (visible: boolean) => void
  children: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  collapsed,
  setCollapsed,
  handleDrawer,
  visible,
  children,
}) => {
  const { isMobile, isTablet } = useContext(MediaQueryContext)

  const siderTrigger = React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
    onClick: () => setCollapsed(!collapsed),
  })
  const drawerTrigger = <MenuOutlined onClick={() => handleDrawer(!visible)} />

  const triggerElement = (isMobile || isTablet) ? (
    <Col span={2} className={styles.drawerTrigger}>
      {drawerTrigger}
    </Col>
  ) : (
    <Col span={2} className={styles.siderTrigger}>
      {siderTrigger}
    </Col>
  )

  return (
    <Header className={styles.pageHeader}>
      <Row>
        {triggerElement}
        {children}
      </Row>
    </Header>
  )
}
