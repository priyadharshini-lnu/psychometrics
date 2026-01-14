import React, { FC } from 'react'
import { Layout, GetProp, MenuProps } from 'antd'

import lighthouseLogo from '~/modules/endUser/assets/images/lighthouseLogoWide.svg'

import { PageSider, SiderMenuItem } from '../PageSider'
import { PageHeader } from '../PageHeader'

import styles from './styles.less'

type SelectEventHandler = GetProp<MenuProps, 'onSelect'>

const { Content } = Layout

type PageLayoutProps = {
  siderItems: SiderMenuItem[]
  footer: React.ReactNode
  headerContent: React.ReactNode
  children: React.ReactNode
  onSiderMenuSelect: SelectEventHandler
  siderFooter?: (collapsed: boolean) => React.ReactElement
}

export const PageLayout: FC<PageLayoutProps> = ({
  siderItems,
  footer,
  headerContent,
  children,
  onSiderMenuSelect,
  siderFooter,
}) => (
  <Layout>
    <PageSider
      logo={lighthouseLogo}
      items={siderItems}
      onMenuSelect={onSiderMenuSelect}
      siderFooter={siderFooter}
    />
    <Layout className={styles['page-layout']}>
      <PageHeader>{headerContent}</PageHeader>
      <Content className={styles['page-content']}>{children}</Content>
      {footer}
    </Layout>
  </Layout>
)
