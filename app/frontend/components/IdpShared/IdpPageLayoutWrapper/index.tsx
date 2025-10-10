import { FC } from 'react'
import { Col, Layout, Flex } from 'antd'

import { PageHeader as GlintPageHeader } from '~/glint'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'

import styles from './IdpPageLayoutWrapper.less'

type Props = {
  children: React.ReactNode,
  style?: React.CSSProperties
}

const IdpPageLayoutWrapper: FC<Props> = ({ children, style = {} }) => (
  <Flex vertical style={{ height: 'calc(100vh - 50px)' }}>
    <GlintPageHeader>
      <Col flex="auto" span={24} className="ta-e">
        <LangDropdownWithChangeLocale />
      </Col>
    </GlintPageHeader>
    <Layout.Content className={styles.pageContent} style={style}>
      {children}
    </Layout.Content>
  </Flex>
)

export default IdpPageLayoutWrapper
