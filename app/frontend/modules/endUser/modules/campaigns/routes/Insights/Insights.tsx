import React from 'react'
import { Col, Layout } from 'antd'

import LangDropdown from 'components/LangDropdown'
import { PageHeader } from 'glint'
import { InsightsHeader } from './InsightsHeader'

import styles from './styles.less'

const { I18n } = window
const locales = I18n.availableLocales
const current = I18n.locale
const { Content } = Layout

export const Insights = () => (
  <>
    <PageHeader>
      <Col flex="auto" span={24} className="ta-e">
        <LangDropdown locales={locales} current={current} />
      </Col>
    </PageHeader>
    <Content className={styles.pageContent}>
      <InsightsHeader />
      <div>Insights component</div>
    </Content>
  </>
)
