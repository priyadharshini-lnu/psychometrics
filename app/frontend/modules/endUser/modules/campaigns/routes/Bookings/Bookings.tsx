import { Col, Layout } from 'antd'

import { PageHeader as GlintPageHeader, FontsizeModifier } from '~/glint'
import RouteList from '~/components/RouteList'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import { routes } from './routes'

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
      <RouteList routes={routes} urlPrefix="" />
    </Layout.Content>
  </>
)
