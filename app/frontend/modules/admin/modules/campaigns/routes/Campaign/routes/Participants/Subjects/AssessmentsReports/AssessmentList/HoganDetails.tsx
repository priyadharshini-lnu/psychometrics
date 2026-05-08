import { FC } from 'react'
import { Descriptions } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

export const HoganDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'hogan') {
    return null
  }

  return (
    <>
      <Descriptions
        layout="horizontal"
        rootClassName="w-100"
        bordered
        column={1}
      >
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_hogan_form_id')}
          key="hogan_form_id"
        >
          {assessment.hoganUserAssessmentDetails?.formId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_hogan_assessment_id')}
          key="hogan_assessment_id"
        >
          {assessment.hoganUserAssessmentDetails?.assessmentId ?? ''}
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}
