import React, { useState, FC } from 'react'
import { Layout } from 'antd'
import { SelectEventHandler } from 'rc-menu/lib/interface'

import lighthouseLogo from 'modules/user/assets/images/lighthouseLogoWide.svg'

import { PageSider, SiderMenuItem } from '../PageSider'
import { PageHeader } from '../PageHeader'

const { Content } = Layout

type PageLayoutProps = {
  siderItems: SiderMenuItem[]
  footer: React.ReactNode
  headerContent: React.ReactNode
  children: React.ReactNode
  handleSiderMenuSelect: SelectEventHandler
  siderFooter?: string | React.ReactElement
}

export const PageLayout: FC<PageLayoutProps> = ({
  siderItems,
  footer, headerContent,
  children,
  handleSiderMenuSelect,
  siderFooter,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [visible, handleVisible] = useState(false)

  return (
    <Layout>
      <PageSider
        logo={lighthouseLogo}
        items={siderItems}
        collapsed={collapsed}
        drawerVisible={visible}
        handleDrawer={handleVisible}
        handleSiderMenuSelect={handleSiderMenuSelect}
        siderFooter={siderFooter}
      />
      <Layout>
        <PageHeader collapsed={collapsed} setCollapsed={setCollapsed} handleDrawer={handleVisible} visible={visible}>
          {headerContent}
        </PageHeader>
        <Content>{children}</Content>
        {footer}
      </Layout>
    </Layout>
  )
}
