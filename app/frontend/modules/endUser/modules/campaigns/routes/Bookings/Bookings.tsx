import { Col, Layout } from 'antd'

import { PageHeader as GlintPageHeader } from '~/glint'
import RouteList from '~/components/RouteList'
import LangDropdown from '~/components/LangDropdown'
import { routes } from './routes'

import styles from './Bookings.less'

export const Bookings = () => (
  <>
    <GlintPageHeader>
      <Col flex="auto" span={24} className="ta-e">
        <LangDropdown />
      </Col>
    </GlintPageHeader>
    <Layout.Content className={styles.pageContent}>
      <RouteList routes={routes} urlPrefix="/invites" />
    </Layout.Content>
  </>
)
