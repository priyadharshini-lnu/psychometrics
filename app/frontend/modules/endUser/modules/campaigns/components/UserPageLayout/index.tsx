import React from 'react'
import { Layout } from 'antd'

import { UserPageSider } from '../UserPageSider'
import { Profile } from '../Profile'
import { Footer } from '../Footer'

import styles from './styles.less'

export const UserPageLayout = ({ children }) => (
  <Layout>
    <UserPageSider siderFooter={collapsed => <Profile collapsed={collapsed} />} />
    <Layout className={styles.pageLayout}>
      {children}
      <Footer />
    </Layout>
  </Layout>
)
