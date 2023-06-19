import React from 'react'
import {
  Col, Row, Space, Collapse, Typography,
} from 'antd'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { General } from './Sections/General'
import { Assets } from './Sections/Assets'
import { Translations } from './Sections/Translations'

const { I18n } = window
const { Panel } = Collapse
interface Props {
  assessment: Assessment
}

export const EditForm: React.FC<Props> = ({ assessment }) => (
  <Row className="pl">
    <Col span={12}>
      <Space direction="vertical" style={{ display: 'flex' }} size="large">
        <Collapse defaultActiveKey={['1']}>
          <Panel
            header={<Typography.Text strong>{I18n.t('assessments.pages.edit.general_settings')}</Typography.Text>}
            key="1"
          >
            <General assessment={assessment} />
          </Panel>
        </Collapse>
        <Collapse>
          <Panel
            header={<Typography.Text strong>{I18n.t('assessments.pages.edit.assets')}</Typography.Text>}
            key="1"
          >
            <Assets assessment={assessment} />
          </Panel>
        </Collapse>
        <Collapse>
          <Panel
            header={<Typography.Text strong>{I18n.t('assessments.pages.edit.translations')}</Typography.Text>}
            key="1"
          >
            <Translations assessment={assessment} />
          </Panel>
        </Collapse>
      </Space>
    </Col>
  </Row>
)
