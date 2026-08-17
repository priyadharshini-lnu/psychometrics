import { FC } from 'react'
import {
  Drawer, Row, Descriptions,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MettlScheduleRecordDetails } from './MettlScheduleRecordDetails'
import { SimulationDetails } from './SimulationDetails'
import { SavilleDetails } from './SavilleDetails'
import { PearsonDetails } from './PearsonDetails'
import { HoganDetails } from './HoganDetails'
import { SkillvueDetails } from './SkillvueDetails'
import { YoodliDetails } from './YoodliDetails'
import { MicrositeDetails } from './MicrositeDetails'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import RawJSON from './RawJSON'
import MhsDetails from './MhsDetails'
import TranscriptionDetails from './TranscriptionDetails'
import { formatedDate } from '~/utils/time'

const { I18n } = window

interface Props {
  close: () => void
  assessment: UserAssessment | undefined
  campaignId: string
  updateMettlSchedule: (
    campaignId: number, campaignAssessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
  loadingUpdateMettlSchedule: boolean
  isSuperAdmin: boolean
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

export const DetailsDrawer: FC<Props> = ({
  close,
  assessment,
  campaignId,
  updateMettlSchedule,
  loadingUpdateMettlSchedule,
  isSuperAdmin,
  updateMhsConfidenceInterval,
  updateMhsLeadershipBar,
  updateMhsNormRegion,
  updateMhsNormOption,
}) => {
  if (!assessment) {
    return null
  }

  const { projectId } = useParams<{ projectId: string }>()

  const formatDrawerDate = (date?: string | null) => (date ? formatedDate(date) : '-')

  return (
    <Drawer
      title={I18n.t('user_assessment.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('user_assessment.column.id')}
            key="id"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {assessment.id}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.assessment_name')}
            key="name"
            className="va-t"
          >
            {assessment.name}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.owner')}
            key="owner"
            className="va-t"
          >
            {assessment.owner?.name || I18n.t('admin.tte')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('user_assessment.column.dimension_id')}
            key="dimension_id"
            className="va-t"
          >
            {assessment.dimensionId}
          </Descriptions.Item>

          <Descriptions.Item
            label={I18n.t('user_assessment.column.norm_id')}
            key="norm_id"
            className="va-t"
          >
            {assessment.normId}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('user_assessment.column.started_at')}
            key="started_at"
            className="va-t"
          >
            {formatDrawerDate(assessment.startedAt)}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('user_assessment.column.completed_at')}
            key="completed_at"
            className="va-t"
          >
            {formatDrawerDate(assessment.completedAt)}
          </Descriptions.Item>
        </Descriptions>

        <MettlScheduleRecordDetails
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
          projectId={projectId}
          updateMettlSchedule={updateMettlSchedule}
          loadingUpdateMettlSchedule={loadingUpdateMettlSchedule}
        />

        <SimulationDetails
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
        />

        {isSuperAdmin && (
          <>
            <SavilleDetails
              I18n={I18n}
              assessment={assessment}
            />

            <PearsonDetails
              I18n={I18n}
              assessment={assessment}
            />

            <HoganDetails
              I18n={I18n}
              assessment={assessment}
            />

            <SkillvueDetails
              I18n={I18n}
              assessment={assessment}
            />

            <YoodliDetails
              I18n={I18n}
              assessment={assessment}
            />
            <MicrositeDetails
              I18n={I18n}
              assessment={assessment}
            />
            <MhsDetails
              I18n={I18n}
              assessment={assessment}
              campaignId={campaignId}
              updateMhsConfidenceInterval={updateMhsConfidenceInterval}
              updateMhsLeadershipBar={updateMhsLeadershipBar}
              updateMhsNormRegion={updateMhsNormRegion}
              updateMhsNormOption={updateMhsNormOption}
            />

            <RawJSON
              I18n={I18n}
              usersResultId={assessment?.usersResultId}
              micrositeRawResponse={
                assessment?.category === 'microsite'
                  ? assessment?.micrositeUserAssessmentDetails?.rawResponse
                  : undefined
              }
            />
          </>
        )}
      </Row>
      <TranscriptionDetails
        assessment={assessment}
        campaignId={campaignId}
      />
    </Drawer>
  )
}
