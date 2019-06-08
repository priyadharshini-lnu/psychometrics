import React from 'react'
import { Layout } from 'antd'
import Navigation from './Navigation'

const { Content } = Layout

export default function PageLayout ({ children }) {
  return (
    <Layout className="ant-layout" style={{ backgroundColor: '#fff' }}>
      <Navigation />
      <Content>
        {children}
      </Content>
    </Layout>
  )
}
