import React from 'react'
import { Col } from 'antd'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import {
  HomeOutlined, LockOutlined, QuestionCircleOutlined, MessageOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

import {
  PageSider, PageLayout, PageFooter, GlintProvider,
} from '~/glint'

import '~/styles/utils.less'

const menuItems = [
  {
    key: 'dashboard',
    label: 'Home',
    icon: <HomeOutlined />,
  },
  {
    key: 'privacy',
    label: 'Privacy',
    icon: <LockOutlined />,
  },
  {
    key: 'help',
    label: 'Help',
    icon: <QuestionCircleOutlined />,
  },
  {
    key: 'livechat',
    label: 'Live Chat',
    icon: <MessageOutlined />,
  },
]

export default {
  title: 'Components/PageSider',
  component: PageSider,
} as ComponentMeta<typeof PageSider>

const Template: ComponentStory<typeof PageSider> = () => {
  const handleMenuClick = (menu) => {
    console.log('clicked on menu item ', menu.key)
  }

  const footerElement = <PageFooter footerMiddle="Privacy Text" footerRight="Logo" />
  return (
    <GlintProvider>
      <PageLayout
        siderItems={menuItems}
        footer={footerElement}
        headerContent={(
          <Col span={24} style={{ textAlign: 'end' }}>
            Locale Switch
          </Col>
        )}
        onSiderMenuSelect={handleMenuClick}
      >
        This is the page content
      </PageLayout>
    </GlintProvider>
  )
}

export const Simple = Template.bind({})
Simple.args = {
  items: menuItems,
}
