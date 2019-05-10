import React from 'react'
import { Layout } from 'antd'
import Navigation from './Navigation'

export default function PageLayout ({ children }) {
  return (
    <Layout className="ant-layout">
      <Navigation />
      <Layout hasSider style={{ marginTop: '16px' }}>
        {children}
      </Layout>
    </Layout>
  )
}
