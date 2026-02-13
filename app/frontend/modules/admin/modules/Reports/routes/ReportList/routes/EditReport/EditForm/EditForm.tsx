import React from 'react'
import { Col, Row, Space } from 'antd'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { General } from './Sections/General'
import { Assets } from './Sections/Assets'
import { Translations } from './Sections/Translations'
import { Panel } from '~/glint'

const { I18n } = window
interface Props {
  report: Report
}

export const EditForm: React.FC<Props> = ({ report }) => (
  <Row>
    <Col lg={12} sm={24} className="pl">
      <Panel title={I18n.t('reports.pages.edit.general_settings')} collapsible>
        <General report={report} />
      </Panel>
    </Col>
    <Col lg={12} sm={24} className="pl">
      <Space orientation="vertical" style={{ display: 'flex' }} size="large">
        <Panel title={I18n.t('reports.pages.edit.assets')} collapsible>
          <Assets report={report} />
        </Panel>
        <Panel title={I18n.t('reports.pages.edit.translations')} collapsible>
          <Translations report={report} />
        </Panel>
      </Space>
    </Col>
  </Row>
)
