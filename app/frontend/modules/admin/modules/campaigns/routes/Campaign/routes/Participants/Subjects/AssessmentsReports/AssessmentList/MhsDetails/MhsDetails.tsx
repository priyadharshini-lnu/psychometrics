import { FC } from 'react'
import { Descriptions } from 'antd'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import MhsConfidenceInterval from './MhsConfidenceInterval'
import MhsLeadershipBar from './MhsLeadershipBar'
import MhsNormRegion from './MhsNormRegion'
import MhsNormOption from './MhsNormOption'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment | undefined
  campaignId: string
  updateMhsConfidenceInterval: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
  updateMhsLeadershipBar: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
   updateMhsNormRegion: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
  updateMhsNormOption: (
    campaignId: string, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
}

export const MhsDetails: FC<Props> = ({
  assessment,
  I18n,
  campaignId,
  updateMhsConfidenceInterval,
  updateMhsLeadershipBar,
  updateMhsNormRegion,
  updateMhsNormOption,
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
      </Descriptions>
      <MhsConfidenceInterval
        I18n={I18n}
        assessment={assessment}
        campaignId={campaignId}
        updateMhsConfidenceInterval={updateMhsConfidenceInterval}
      />
      <MhsLeadershipBar
        I18n={I18n}
        assessment={assessment}
        campaignId={campaignId}
        updateMhsLeadershipBar={updateMhsLeadershipBar}
      />
      <MhsNormRegion
        I18n={I18n}
        assessment={assessment}
        campaignId={campaignId}
        updateMhsNormRegion={updateMhsNormRegion}
      />
      <MhsNormOption
        I18n={I18n}
        assessment={assessment}
        campaignId={campaignId}
        updateMhsNormOption={updateMhsNormOption}
      />
    </>
  )
}
