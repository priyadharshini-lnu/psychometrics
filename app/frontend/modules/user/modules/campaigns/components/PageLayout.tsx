import React, { ReactNode, FC } from 'react'
import { Layout } from 'antd'

import Footer from './Footer'
import Navigation from './Navigation'

interface Props {
  children: ReactNode
}

export const PageLayout: FC<Props> = ({ children }) => (
  <Layout className="min-h-screen">
    <Navigation />
    <Layout.Content>{children}</Layout.Content>
    <Footer />
  </Layout>
)
