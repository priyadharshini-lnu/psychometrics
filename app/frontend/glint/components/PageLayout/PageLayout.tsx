import React, { FC } from 'react'
import { Layout } from 'antd'
import { SelectEventHandler } from 'rc-menu/lib/interface'

import lighthouseLogo from 'modules/user/assets/images/lighthouseLogoWide.svg'

import { PageSider, SiderMenuItem } from '../PageSider'
import { PageHeader } from '../PageHeader'

import styles from './styles.less'

const { Content } = Layout

type PageLayoutProps = {
  siderItems: SiderMenuItem[]
  footer: React.ReactNode
  headerContent: React.ReactNode
  children: React.ReactNode
  onSiderMenuClick: SelectEventHandler
  siderFooter?: (collapsed: boolean) => React.ReactElement
}

export const PageLayout: FC<PageLayoutProps> = ({
  siderItems,
  footer,
  headerContent,
  children,
  onSiderMenuClick,
  siderFooter,
}) => (
  <Layout>
    <PageSider
      logo={lighthouseLogo}
      items={siderItems}
      onMenuClick={onSiderMenuClick}
      siderFooter={siderFooter}
    />
    <Layout className={styles['page-layout']}>
      <PageHeader>{headerContent}</PageHeader>
      <Content className={styles['page-content']}>{children}</Content>
      {footer}
    </Layout>
  </Layout>
)
