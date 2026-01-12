import { FC } from 'react'
import {
  Drawer, Row, Descriptions,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MettlScheduleRecordDetails } from './MettlScheduleRecordDetails'
import { SimulationDetails } from './SimulationDetails'
import { SavilleDetails } from './SavilleDetails'
import { PearsonDetails } from './PearsonDetails'
import { SkillvueDetails } from './SkillvueDetails'
import { YoodliDetails } from './YoodliDetails'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import RawJSON from './RawJSON'
import TranscriptionDetails from './TranscriptionDetails'

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
}

export const DetailsDrawer: FC<Props> = ({
  close,
  assessment,
  campaignId,
  updateMettlSchedule,
  loadingUpdateMettlSchedule,
  isSuperAdmin,
}) => {
  if (!assessment) {
    return null
  }

  const { projectId } = useParams<{ projectId: string }>()

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

            <SkillvueDetails
              I18n={I18n}
              assessment={assessment}
            />

            <YoodliDetails
              I18n={I18n}
              assessment={assessment}
            />

            <RawJSON
              I18n={I18n}
              usersResultId={assessment?.usersResultId}
            />
          </>
        )}
      </Row>
      <TranscriptionDetails
        assessment={assessment}
      />
    </Drawer>
  )
}
