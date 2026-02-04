import { FC } from 'react'
import { Descriptions, Switch } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
}

export const MhsDetails: FC<Props> = ({
  assessment,
  I18n,
}) => {
  if (!assessment || assessment.category !== 'mhs') {
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
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.mhs_external_assessment_id')}
          key="mhs_external_assessment_id"
        >
          {assessment.mhsUserAssessmentDetails?.externalAssessmentId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.mhs_session_id')}
          key="mhs_session_id"
        >
          {assessment.mhsUserAssessmentDetails?.sessionId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.mhs_data_gatherer_id')}
          key="mhs_data_gatherer_id"
        >
          {assessment.mhsUserAssessmentDetails?.dataGathererId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.mhs_data_gathering_id')}
          key="mhs_data_gathering_id"
        >
          {assessment.mhsUserAssessmentDetails?.dataGatheringId ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.campaign_assessment_mhs_confidence_interval')}
          key="mhs_confidence_interval"
        >
          <Switch
            checked={Boolean(assessment.mhsUserAssessmentDetails?.confidenceInterval)}
            disabled
          />
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.campaign_assessment_mhs_leadership_bar')}
          key="mhs_leadership_bar"
        >
          <Switch
            checked={Boolean(assessment.mhsUserAssessmentDetails?.leadershipBar)}
            disabled
          />
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.campaign_assessment_mhs_norm_region')}
          key="mhs_norm_region"
        >
          {assessment.mhsUserAssessmentDetails?.normRegion ?? ''}
        </Descriptions.Item>
        <Descriptions.Item
          className="va-t w-30"
          styles={{
            label: { width: '40%' },
            content: { width: '60%' },
          }}
          label={I18n.t('admin.campaign_assessment_mhs_norm_option')}
          key="mhs_norm_option"
        >
          {assessment.mhsUserAssessmentDetails?.normOption ?? ''}
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}
