import React from 'react'
import {
  Row, Col, Button, Space, Divider, Menu, Typography, Pagination, Dropdown, Spin, SpaceProps,
  ConfigProvider, theme,
} from 'antd'
import { MailOutlined, SettingOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { constants } from '~/glint/components/DefaultAntThemeWrapper/constants'

const { I18n } = window
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
    label: I18n.t('admin.tab_text_one'),
  },
  {
    key: 'SubMenu',
    icon: <SettingOutlined />,
    label: I18n.t('admin.tab_text_two'),
    children: [
      {
        type: 'group',
        label: I18n.t('admin.submenu_options_option_title'),
        children: [
          {
            key: 'setting:1',
            label: I18n.t('admin.submenu_options_option_one'),
          },
          {
            key: 'setting:2',
            label: I18n.t('admin.submenu_options_option_two'),
          },
        ],
      },
    ],
  },
]
const { DEFAULT_PRIMARY_COLOR, DEFAULT_BORDER_RADIUS } = constants
const { useToken } = theme

const SplitSpace: React.FC<SpaceProps> = props => (
  <Space separator={<Divider type="vertical" />} size={4} {...props} />
)

export const DesignPreview: React.FC<Props> = ({ config }) => {
  const { token } = useToken()
  const primaryColor = config.primaryColor || DEFAULT_PRIMARY_COLOR

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          colorError: config.errorColor || token.colorError,
          colorWarning: config.warningColor || token.colorWarning,
          colorSuccess: config.successColor || token.colorSuccess,
          colorInfo: config.infoColor || token.colorInfo,
          borderRadius: DEFAULT_BORDER_RADIUS,
        },
      }}
    >
      <Space orientation="vertical" separator={<Divider />} style={{ width: '100%' }} size={0}>

        <SplitSpace>
          <Button type="primary" ghost>
            {I18n.t('admin.primary_button')}
          </Button>
          <Button ghost>
            {I18n.t('admin.default_button')}
          </Button>
          <Button type="dashed" ghost>
            {I18n.t('admin.dashed_button')}
          </Button>
          <Button type="primary" ghost danger>
            {I18n.t('admin.primary_button')}
          </Button>
          <Button ghost danger>
            {I18n.t('admin.default_button')}
          </Button>
          <Button type="dashed" ghost danger>
            {I18n.t('admin.dashed_button')}
          </Button>
        </SplitSpace>
        <SplitSpace>
          <Typography.Text type="success">
            {I18n.t('admin.text_success')}
          </Typography.Text>
          <Typography.Text type="warning">
            {I18n.t('admin.text_warning')}
          </Typography.Text>
          <Typography.Text type="danger">
            {I18n.t('admin.text_danger')}
          </Typography.Text>
          <Typography.Link href="#" target="_blank">
            {I18n.t('admin.link_text')}
          </Typography.Link>
          <Typography.Text copyable>{I18n.t('admin.copy_text')}</Typography.Text>

          {/* Dropdown */}
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: I18n.t('admin.hover_options_first_menu_item'),
                },
                {
                  key: '2',
                  label: I18n.t('admin.hover_options_danger_item'),
                  danger: true,
                },
              ],
            }
            }
          >
            <a onClick={e => e.preventDefault()}>
              <Space>
                {I18n.t('admin.hover_text')}
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
