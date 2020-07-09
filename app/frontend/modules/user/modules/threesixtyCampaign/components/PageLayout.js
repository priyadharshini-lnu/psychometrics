import React from 'react'
import { Layout } from 'antd'
import Navigation from './Navigation'
import Footer from './Footer'

const { Content } = Layout

export default function PageLayout ({ children }) {
  return (
    <Layout>
      <Navigation />
      <Content>
        {children}
      </Content>
      <Footer />
    </Layout>
  )
}
