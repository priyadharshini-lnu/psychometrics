import { FC } from 'react'
import { Descriptions } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

const formatErrorDetails = (errorDetails: Record<string, unknown> | null | undefined): string => {
  if (!errorDetails || Object.keys(errorDetails ?? {}).length === 0) {
    return ''
  }

  return JSON.stringify(errorDetails)
}

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

export const PearsonDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'pearson') {
    return null
  }

  const errorDetails = formatErrorDetails(assessment.pearsonUserAssessmentDetails?.errorDetails)

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
          label={I18n.t('campaign_assessment.column.pearson_schedule_id')}
          key="pearson_schedule_id"
        >
          {assessment.pearsonUserAssessmentDetails?.scheduleId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('campaign_assessment.column.pearson_norm_id')}
          key="pearson_norm_id"
        >
          {assessment.pearsonUserAssessmentDetails?.normId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_pearson_product_id')}
          key="pearson_product_id"
        >
          {assessment.pearsonUserAssessmentDetails?.productId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_pearson_assessment_id')}
          key="pearson_assessment_id"
        >
          {assessment.pearsonUserAssessmentDetails?.assessmentId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
          label={I18n.t('admin.campaign_assessment_column_pearson_assessment_language')}
          key="pearson_assessment_language"
        >
          {assessment.pearsonUserAssessmentDetails?.assessmentLanguage ?? ''}
        </Descriptions.Item>
        {errorDetails ? (
          <Descriptions.Item
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
            label={I18n.t('admin.campaign_assessment_column_pearson_error_details')}
            key="pearson_error_details"
          >
            {errorDetails}
          </Descriptions.Item>
        ) : null}
      </Descriptions>
    </>
  )
}
