import { FC } from 'react'
import {
  Button, Drawer, Row, Descriptions, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { SimulationDetails } from './SimulationDetails'
import { MettlScheduleRecordDetails } from './MettlScheduleRecordDetails'
import { PearsonVariationForm } from './PearsonVariationForm'
import MhsConfidenceIntervalForm from './MhsConfidenceIntervalForm'
import MhsLeadershipBarForm from './MhsLeadershipBarForm'
import MhsNormRegionForm from './MhsNormRegionForm'
import { MhsNormOptionForm } from './MhsNormOptionForm'

const { I18n } = window

interface Props {
  close: () => void
  assessment: Assessment | undefined
  campaignId: string
  openModal: (name: string, props: object) => void
  updateMettlSchedule: (
    campaignId: number, assessmentId: number, body: { assessment: { id: string } }
  ) => Promise<{ response: unknown }>
  loadingUpdateMettlSchedule: boolean,
  updatePearsonVariation: (campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
  updateMhsConfidenceInterval: (
    campaignId: string,
    assessmentId: number,
    body: object
  ) => Promise<{ response: unknown }>
  updateMhsLeadershipBar: (campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
  updateMhsNormRegion: (campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
  updateMhsNormOption: (campaignId: string, assessmentId: number, body: object) => Promise<{ response: unknown }>
  toggleAssessmentCaching: (campaignId: number, id: number, cachingEnabled: boolean) => void
}

export const DetailsDrawer: FC<Props> = ({
  close,
  assessment,
  campaignId,
  openModal,
  updateMettlSchedule,
  loadingUpdateMettlSchedule,
  updateMhsConfidenceInterval,
  updatePearsonVariation,
  updateMhsLeadershipBar,
  updateMhsNormRegion,
  updateMhsNormOption,
  toggleAssessmentCaching,
}) => {
  if (!assessment) {
    return null
  }
  const parsedCampaignId = parseInt(campaignId, 10)
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <Drawer
      title={I18n.t('campaign_assessment.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      size="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.id')}
            key="id"
            className="va-t w-30"
            styles={{
              label: { width: '40%' },
              content: { width: '60%' },
            }}
          >
            {assessment.campaignAssessmentId}
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
            {assessment.owner?.name || I18n.t('admin.platform_owner')}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.dimension_id')}
            key="dimension_id"
            className="va-t"
          >
            {assessment.dimensionId}
          </Descriptions.Item>

          {assessment.dimensionHasOccupations && (
            <Descriptions.Item
              label={I18n.t('admin.campaign_assessment_column_occupation_condition_set')}
              key="occupation_condition_set"
              className="va-t"
            >
              {assessment.permissions.updateOccupationConditionSet ? (
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  onClick={() => openModal('UpdateConditionSetModal', {
                    campaignId: parseInt(campaignId, 10),
                    campaignAssessmentId: assessment.id,
                  })}
                >
                  {assessment.occupationConditionSetName || I18n.t('common.text.default')}
                </Button>
              ) : (
                assessment.occupationConditionSetName || I18n.t('common.text.default')
              )}
            </Descriptions.Item>
          )}

          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.norm_id')}
            key="norm_id"
            className="va-t"
          >
            {assessment.normId}
          </Descriptions.Item>
          { assessment.allowCaching && (
            <Descriptions.Item
              label={I18n.t('admin.campaign_assessment_column_caching_enabled')}
              key="caching_enabled"
              className="va-t"
            >
              <Switch
                checked={assessment.cachingEnabled}
                disabled={!assessment.permissions.toggleCaching}
                onChange={() => toggleAssessmentCaching(parsedCampaignId, assessment.id, !assessment.cachingEnabled)}
              />
            </Descriptions.Item>
          )}

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

        <PearsonVariationForm
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
          updatePearsonVariation={updatePearsonVariation}
        />
        <MhsConfidenceIntervalForm
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
          updateMhsConfidenceInterval={updateMhsConfidenceInterval}
        />
        <MhsLeadershipBarForm
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
          updateMhsLeadershipBar={updateMhsLeadershipBar}
        />
        <MhsNormRegionForm
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
          updateMhsNormRegion={updateMhsNormRegion}
        />
        <MhsNormOptionForm
          I18n={I18n}
          assessment={assessment}
          campaignId={campaignId}
          updateMhsNormOption={updateMhsNormOption}
        />
      </Row>
    </Drawer>
  )
}
