import React from 'react'
import {
  Col, Row, Tabs,
} from 'antd'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { General } from './Sections/General'
import { Assets } from './Sections/Assets'
import { Translations } from './Sections/Translations'

const { I18n } = window
interface Props {
  report: Report
}

const tabContentStyle = {
  padding: '16px 20px',
  maxWidth: 900,
}

export const EditForm: React.FC<Props> = ({ report }) => {
  const items = [
    {
      key: 'general',
      label: I18n.t('reports.pages.edit.general_settings'),
      children: (
        <Row>
          <Col lg={12} sm={24} className="pl">
            <General report={report} />
          </Col>
        </Row>
      ),
    },
    {
      key: 'assets',
      label: I18n.t('reports.pages.edit.assets'),
      children: (
        <div style={tabContentStyle}>
          <Assets report={report} />
        </div>
      ),
    },
    {
      key: 'translations',
      label: I18n.t('reports.pages.edit.translations'),
      children: (
        <div style={tabContentStyle}>
          <Translations report={report} />
        </div>
      ),
    },
  ]

  return (
    <Tabs items={items} tabBarStyle={{ paddingLeft: 20 }} />
  )
}
