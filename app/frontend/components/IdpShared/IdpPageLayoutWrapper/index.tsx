import { FC } from 'react'
import { Col, Layout } from 'antd'

import { PageHeader as GlintPageHeader } from '~/glint'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'

import styles from './IdpPageLayoutWrapper.less'

type Props = {
  children: React.ReactNode
}

const IdpPageLayoutWrapper: FC<Props> = ({ children }) => (
  <>
    <GlintPageHeader>
      <Col flex="auto" span={24} className="ta-e">
        <LangDropdownWithChangeLocale />
      </Col>
    </GlintPageHeader>
    <Layout.Content className={styles.pageContent}>
      {children}
    </Layout.Content>
  </>
)

export default IdpPageLayoutWrapper
