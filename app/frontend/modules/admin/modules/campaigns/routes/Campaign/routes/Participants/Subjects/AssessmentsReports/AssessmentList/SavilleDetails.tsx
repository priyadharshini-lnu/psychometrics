import { FC } from 'react'
import { Descriptions } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

export const SavilleDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'saville') {
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
          label={I18n.t('campaign_assessment.column.saville_data_separator')}
          key="saville_data_separator"
        >
          {assessment.savilleUserAssessmentDetails?.dataSeprator ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('campaign_assessment.column.saville_candidate_id')}
          key="saville_candidate_id"
        >
          {assessment.savilleUserAssessmentDetails?.candidateId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_saville_request_id')}
          key="saville_request_id"
        >
          {assessment.savilleUserAssessmentDetails?.requestId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_saville_norm_id')}
          key="saville_norm_id"
        >
          {assessment.savilleUserAssessmentDetails?.normId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_saville_error_code')}
          key="saville_error_code"
        >
          {assessment.savilleUserAssessmentDetails?.errorCode ?? ''}
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}
