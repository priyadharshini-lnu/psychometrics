import React from 'react'
import {
  Col, Row, Tabs,
} from 'antd'
import { MemberAction } from 'hooks/useResources/interfaces'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { General } from './Sections/General'
import { Assets } from './Sections/Assets'
import { Translations } from './Sections/Translations'
import { AIAssistant } from './Sections/AIAssistant'
import { DataRole } from './Sections/DataRole'
import { QuestionMapping } from './Sections/QuestionMapping'

const { I18n } = window
interface Props {
  assessment: Assessment
  memberAction: MemberAction
}

const tabContentStyle = { padding: '16px 20px', maxWidth: 900 }

export const EditForm: React.FC<Props> = ({ assessment, memberAction }) => {
  const items = [
    {
      key: 'general',
      label: I18n.t('assessments.pages.edit.general_settings'),
      children: (
        <Row>
          <Col lg={12} sm={24} className="pl">
            <General assessment={assessment} />
          </Col>
        </Row>
      ),
    },
    {
      key: 'assets',
      label: I18n.t('assessments.pages.edit.assets'),
      children: (
        <div style={tabContentStyle}>
          <Assets assessment={assessment} />
        </div>
      ),
    },
    {
      key: 'translations',
      label: I18n.t('assessments.pages.edit.translations'),
      children: (
        <div style={tabContentStyle}>
          <Translations assessment={assessment} memberAction={memberAction} />
        </div>
      ),
    },
    {
      key: 'aiAssistant',
      label: I18n.t('admin.ai_assistant'),
      children: (
        <div style={tabContentStyle}>
          <AIAssistant assessment={assessment} />
        </div>
      ),
    },
    {
      key: 'dataRole',
      label: I18n.t('shared.data_role'),
      children: (
        <div style={tabContentStyle}>
          <DataRole assessment={assessment} />
        </div>
      ),
    },
    ...(assessment.type === 'microsite' ? [{
      key: 'questionMapping',
      label: I18n.t('admin.question_mapping'),
      children: (
        <div style={tabContentStyle}>
          <QuestionMapping assessment={assessment} />
        </div>
      ),
    }] : []),
  ]

  return <Tabs items={items} tabBarStyle={{ paddingLeft: 20 }} />
}
