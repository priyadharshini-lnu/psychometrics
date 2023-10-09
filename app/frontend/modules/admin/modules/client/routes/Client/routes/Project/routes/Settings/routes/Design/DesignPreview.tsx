import React, { useEffect } from 'react'
import {
  Row, Col, Button, Space, Divider, Menu, Typography, Pagination, Dropdown, Spin, SpaceProps,
  ConfigProvider,
} from 'antd'
import { MailOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons'

interface Props {
  config: {
    primaryColor?: string;
    infoColor?: string;
    successColor?: string;
    processingColor?: string;
    errorColor?: string;
    warningColor?: string;
  }
}
const menuItems = [
  {
    key: 'mail',
    icon: <MailOutlined />,
    label: 'Mail',
  },
  {
    key: 'SubMenu',
    icon: <SettingOutlined />,
    label: 'Submenu',
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          {
            key: 'setting:1',
            label: 'Option 1',
          },
          {
            key: 'setting:2',
            label: 'Option 2',
          },
        ],
      },
    ],
  },
]

const SplitSpace: React.FC<SpaceProps> = props => (
  <Space split={<Divider type="vertical" />} size={4} {...props} />
)

export const DesignPreview: React.FC<Props> = ({ config }) => {
  useEffect(() => {
    ConfigProvider.config({
      theme: {
        primaryColor: config.primaryColor,
        infoColor: config.infoColor,
        successColor: config.successColor,
        processingColor: config.processingColor,
        errorColor: config.errorColor,
        warningColor: config.warningColor,
      },
    })
  }, [config])

  return (
    <ConfigProvider>
      <Space direction="vertical" split={<Divider />} style={{ width: '100%' }} size={0}>

        <SplitSpace>
          <Button type="primary" ghost>
            Primary
          </Button>
          <Button ghost>Default</Button>
          <Button type="dashed" ghost>
            Dashed
          </Button>
          <Button type="primary" ghost danger>
            Primary
          </Button>
          <Button ghost danger>
            Default
          </Button>
          <Button type="dashed" ghost danger>
            Dashed
          </Button>
        </SplitSpace>
        <SplitSpace>
          <Typography.Text type="success">Text (success)</Typography.Text>
          <Typography.Text type="warning">Text(warning)</Typography.Text>
          <Typography.Text type="danger">Text(danger)</Typography.Text>
          <Typography.Link href="#" target="_blank">
            Link
          </Typography.Link>
          <Typography.Text copyable>Text</Typography.Text>

          {/* Dropdown */}
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: '1st menu item',
                },
                {
                  key: '2',
                  label: 'a danger item',
                  danger: true,
                },
              ],
            }
            }
          >
            <a onClick={e => e.preventDefault()}>
              <Space>
                Hover me
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>

          {/* Spin */}
          <Spin />
        </SplitSpace>

        <Row gutter={16}>
          <Col span={12}>
            <Menu mode="horizontal" defaultSelectedKeys={['mail']} items={menuItems} />
          </Col>
        </Row>

        {/* Menu - vertical */}
        <Row gutter={16}>
          <Col span={12}>
            <Menu mode="inline" defaultSelectedKeys={['mail']} items={menuItems} />
          </Col>
        </Row>

        {/* Pagination */}
        <Pagination showQuickJumper defaultCurrent={2} total={30} />
      </Space>
    </ConfigProvider>
  )
}
