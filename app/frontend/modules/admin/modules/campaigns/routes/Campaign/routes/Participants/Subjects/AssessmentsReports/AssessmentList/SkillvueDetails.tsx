import { FC } from 'react'
import { Descriptions } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

export const SkillvueDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'skillvue') {
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
          label={I18n.t('campaign_assessment.column.skillvue_email_id')}
          key="skillvue_email_id"
        >
          {assessment.skillvueUserAssessmentDetails?.email ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('campaign_assessment.column.skillvue_external_assessment_id')}
          key="skillvue_external_assessment_id"
        >
          {assessment.skillvueUserAssessmentDetails?.externalAssessmentId ?? ''}
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}
