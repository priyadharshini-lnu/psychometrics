import React, { useState } from 'react'
import { Col, Row, Menu } from 'antd'
import { Saml } from './Saml'
import { SamlServiceProviders } from '../SamlServiceProviders/SamlServiceProviders'

const { I18n } = window

const TabContent: React.FC<{ selectedKey: string }> = ({ selectedKey }) => {
  switch (selectedKey) {
    case 'settings':
      return <Saml />
    case 'service-providers':
      return <SamlServiceProviders />
    default:
      return <Saml />
  }
}

export const SamlTabbed: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('settings')

  const menuItems = [
    {
      key: 'settings',
      label: I18n.t('admin.sso_settings'),
    },
    {
      key: 'service-providers',
      label: I18n.t('admin.saml_service_providers'),
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key)
  }

  return (
    <Row>
      <Col span={24}>
        <div className="saml-menu-container">
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ marginBottom: 16, paddingLeft: '' }}
          />
          <div style={{ padding: '0 20px' }}>
            <TabContent selectedKey={selectedKey} />
          </div>
        </div>
      </Col>
    </Row>
  )
}
