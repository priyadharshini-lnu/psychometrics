import { FC } from 'react'
import { Descriptions } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

export const YoodliDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'yoodli') {
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
          label={I18n.t('admin.yoodli_external_assessment_id')}
          key="yoodli_external_assessment_id"
        >
          {assessment.yoodliUserAssessmentDetails?.externalAssessmentId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.yoodli_email_id')}
          key="yoodli_email_id"
        >
          {assessment.yoodliUserAssessmentDetails?.email ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.yoodli_activity_id')}
          key="yoodli_activity_id"
        >
          {assessment.yoodliUserAssessmentDetails?.yoodliActivityId ?? ''}
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}
