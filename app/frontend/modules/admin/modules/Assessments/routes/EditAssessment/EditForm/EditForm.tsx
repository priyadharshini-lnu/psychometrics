import React from 'react'
import { Col, Row, Space } from 'antd'
import { MemberAction } from 'hooks/useResources/interfaces'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { General } from './Sections/General'
import { Assets } from './Sections/Assets'
import { Translations } from './Sections/Translations'
import { Panel } from '~/glint'

const { I18n } = window
interface Props {
  assessment: Assessment
  memberAction: MemberAction
}

export const EditForm: React.FC<Props> = ({ assessment, memberAction }) => (
  <Row>
    <Col lg={12} sm={24} className="pl">
      <Panel title={I18n.t('assessments.pages.edit.general_settings')} collapsible>
        <General assessment={assessment} />
      </Panel>
    </Col>
    <Col lg={12} sm={24} className="pl">
      <Space direction="vertical" style={{ display: 'flex' }} size="large">
        <Panel title={I18n.t('assessments.pages.edit.assets')} collapsible>
          <Assets assessment={assessment} />
        </Panel>
        <Panel title={I18n.t('assessments.pages.edit.translations')} collapsible>
          <Translations assessment={assessment} memberAction={memberAction} />
        </Panel>
      </Space>
    </Col>
  </Row>
)
