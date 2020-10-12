import React from 'react'
import { Layout } from 'antd'
import Navigation from './Navigation'
import Footer from './Footer'
import styles from './PageLayout.scss'

const { Content } = Layout

export default function PageLayout ({ children }) {
  return (
    <Layout>
      <Navigation />
      <Content className={styles.pageContent}>
        {children}
      </Content>
      <Footer />
    </Layout>
  )
}
