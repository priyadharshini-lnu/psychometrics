import { Col, Layout } from 'antd'
import { Outlet } from 'react-router-dom'

import { PageHeader as GlintPageHeader, FontsizeModifier } from '~/glint'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'

import styles from './Bookings.less'

export const Bookings = () => (
  <>
    <GlintPageHeader>
      <Col flex="auto" span={24} className="ta-e">
        <FontsizeModifier />
        <LangDropdownWithChangeLocale />
      </Col>
    </GlintPageHeader>
    <Layout.Content className={styles.pageContent}>
      <Outlet />
    </Layout.Content>
  </>
)
