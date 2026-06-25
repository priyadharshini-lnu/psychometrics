import React, { useState, useEffect } from 'react'
import {
  Table, Row, Col, Switch, App, Tag,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getActionsMenuProps } from './getActionsMenuProps'
import { PropsFromRedux } from './connect'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { DetailsDrawer } from './DetailsDrawer'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

const { Column } = Table
const { I18n } = window

export type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments: {
    list,
    permissions,
  },
  isLoadingAssessmentsAndReports,
  openModal,
  rescoreResponses,
  regenerateTranscriptions,
  exportRawResults,
  exportScoringResults,
  exportNormedResults,
  exportRawFactorScores,
  exportExternalResults,
  exportOccupations,
  updateMettlSchedule,
  updateExternalConfig,
  updatePrework,
  enableUniversalLink,
  toggleRequireScheduling,
  toggleAutoAssign,
  normalizeFactorScores,
  loadingUpdateMettlSchedule,
  updatePearsonVariation,
  updateMhsConfidenceInterval,
  updateMhsLeadershipBar,
  updateMhsNormRegion,
  updateMhsNormOption,
  toggleAssessmentCaching,
  updateProctoringSettings,
  loadingUpdateProctoringSettings,
  campaignOptions,
  fetchCampaignOptions,
}) => {
  const [drawerAssessment, setDrawerAssessment] = useState<Assessment | undefined>()
  const { projectId, campaignId } = useParams() as { projectId: string, campaignId: string }
  const assessmentIdRef = React.useRef<number | null>(null)
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)
  const { message, modal } = App.useApp()

  const handleTogglePrework = (assessment: Assessment, parsedCampaignId: number, checked: boolean) => {
    openModal('ApplyToExistingUsersFormModal', {
      assessment,
      parsedCampaignId,
      updatePrework,
      checked,
    })
  }

  const handleToggleSelectiveProctoring = (assessment: Assessment, checked: boolean) => {
    if (checked && !assessment.isTimed) {
      message.error(I18n.t('admin.proctoring_errors_timed_only'), 5)
      return
    }
    assessmentIdRef.current = assessment.id

    updateProctoringSettings(parsedCampaignId, assessment.id, {
      proctoringEnabled: checked,
    }).then(() => {
      message.success(I18n.t('admin.settings_saved_successfully'))
    })
  }

  useEffect(() => {
    // This effect is used to trigger a re-render of the drawer,so that updating the assessment through the drawer shows
    // the updated values without needing to close and open it again to reflect the change.
    if (!drawerAssessment?.id) return
    const foundAssessment = list.find(({ id }) => id === drawerAssessment.id)
    if (foundAssessment) {
      setDrawerAssessment(foundAssessment)
    } else {
      setDrawerAssessment(undefined)
    }
  }, [list, drawerAssessment?.id])

  useEffect(() => {
    if (campaignOptions?.selectiveProctoringEnabled === undefined) {
      fetchCampaignOptions(parsedProjectId, parsedCampaignId)
    }
  }, [campaignOptions?.selectiveProctoringEnabled, parsedProjectId, parsedCampaignId])

  return (
    <Row>
      <Col span={24}>
        <Table
          className="mtm"
          rowKey="id"
          loading={isLoadingAssessmentsAndReports}
          dataSource={list}
          pagination={false}
        >
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="assessmentId"
            key="assessmentId"
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessment_name')}
            key="name"
            dataIndex="name"
            width={220}
            render={(text, record: Assessment) => (
              <>
                <div>
                  <a onClick={() => setDrawerAssessment(record)}>{text}</a>
                </div>
                {record.isTimed && record.fixedTimeDuration && (
                  <Tag color="blue">
                    {I18n.t('admin.timed_label', { time_text: secondsToDayHoursAndMinutes(record.fixedTimeDuration) })}
                  </Tag>
                )}
              </>
            )}
          />
          <Column
            title={I18n.t('campaign_assessment.column.auto_assign')}
            key="autoAssign"
            render={({ autoAssign, id }) => (
              <Switch
                checked={autoAssign}
                disabled={!permissions.toggleAutoAssign}
                onChange={() => toggleAutoAssign(parsedCampaignId, id, !autoAssign)}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.require_scheduling')}
            key="requireScheduling"
            width={100}
            render={({ requireScheduling, id }) => (
              <Switch
                checked={requireScheduling}
                disabled={!permissions.toggleRequireScheduling}
                onChange={() => {
                  toggleRequireScheduling(parsedCampaignId, id, !requireScheduling)
                }}
              />
            )}
          />
          {campaignOptions.selectiveProctoringEnabled && (
            <Column
              title={I18n.t('admin.proctoring')}
              key="selectiveProctoring"
              render={(assessment: Assessment) => (
                <Switch
                  checked={assessment.proctoringEnabled}
                  disabled={!campaignOptions.selectiveProctoringEnabled}
                  onChange={checked => handleToggleSelectiveProctoring(assessment, checked)}
                  loading={assessment.id === assessmentIdRef.current && loadingUpdateProctoringSettings}
                />
              )}
            />
          )}
          <Column
            title={I18n.t('campaign_assessment.column.norm')}
            key="normName"
            render={({
              normName, id, isExternal, hasExternalNorm,
            }) => {
              if (isExternal && !hasExternalNorm) {
                return I18n.t('common.text.na')
              }
              return (
                permissions.updateNorm ? (
                  <a
                    onClick={
                      () => openModal('UpdateNormModal',
                        { projectId: parsedProjectId, campaignId: parsedCampaignId, campaignAssessmentId: id })
                    }
                  >
                    {normName || I18n.t('common.text.default')}
                  </a>
                ) : normName || I18n.t('common.text.default')
              )
            }}
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessor_form')}
            key="linkedAssessment"
            render={({ assessorFormName }) => assessorFormName || I18n.t('common.text.na')}
          />

          <Column
            title={I18n.t('campaign_assessment.column.locales')}
            key="availableLocales"
            render={({
              availableLocales, id, isExternal, category, allLocales,
            }) => {
              if (isExternal && category !== 'simulation') {
                return I18n.t('common.text.na')
              }
              if (!permissions.updateAvailableLocales) {
                return _.join(availableLocales, '')
              }
              return (
                <a
                  onClick={
                    () => openModal('UpdateLocalesModal',
                      {
                        projectId: parsedProjectId,
                        campaignId: parsedCampaignId,
                        campaignAssessmentId: id,
                        availableLocales,
                        allLocales,
                      })
                  }
                >
                  {_.isEmpty(availableLocales) ? I18n.t('frontend.manage') : _.join(availableLocales, ', ')}
                </a>
              )
            }}
          />

          <Column
            title={I18n.t('campaign_assessment.column.universal_link')}
            key="universalLink"
            render={({
              enableUniversalLinks, universalLink, id, isExternal, allowMultipleResponses,
            }) => {
              if (isExternal) {
                return (
                  I18n.t('common.text.na')
                )
              }

              const open = (response?: { universalLink: string, enableUniversalLinks: boolean }) => {
                openModal('UniversalLinkModal',
                  {
                    projectId: parsedProjectId,
                    campaignId: parsedCampaignId,
                    campaignAssessmentId: id,
                    universalLink: universalLink || response?.universalLink,
                    enableUniversalLinks: enableUniversalLinks || response?.enableUniversalLinks,
                    allowMultipleResponses,
                    manageUniversalLink: permissions.enableUniversalLink,
                  })
              }
              return (!universalLink
                ? (
                  <a onClick={() => enableUniversalLink(campaignId, id).then(({ response }) => open(response))}>
                    {I18n.t('frontend.activate')}
                  </a>
                )
                : (
                  <a onClick={() => open()}>{I18n.t('frontend.manage')}</a>
                )
              )
            }}
          />
          <Column
            title={I18n.t('campaign_assessment.column.prework')}
            key="category"
            render={assessment => (
              <Switch
                checked={assessment.prework}
                disabled={!permissions.updatePrework}
                onChange={
                  checked => handleTogglePrework(assessment, parsedCampaignId, checked)
                }
              />
            )}
          />
          <Column
            title={I18n.t('common.column.action')}
            key="action"
            render={assessment => (
              <ConditionalDropdown
                menu={
                  getActionsMenuProps({
                    assessment,
                    campaignId: parsedCampaignId,
                    projectId: parsedProjectId,
                    openModal,
                    rescoreResponses: (
                      aiRescore = false,
                    ) => rescoreResponses(parsedCampaignId, assessment.id, aiRescore),
                    regenerateTranscriptions: (
                      () => regenerateTranscriptions(parsedCampaignId, assessment.id)
                    ),
                    exportRawResults,
                    exportScoringResults,
                    exportNormedResults,
                    exportRawFactorScores,
                    exportOccupations,
                    normalizeFactorScores: (
                      () => normalizeFactorScores(parsedCampaignId, assessment.id)
                    ),
                    exportExternalResults,
                    updateExternalConfig,
                    message,
                    modal,
                  })
                }
                innerElement={(
                  <a>
                    <MoreOutlined />
                  </a>
                )}
              />
            )}
          />
        </Table>
        {drawerAssessment ? (
          <DetailsDrawer
            close={() => setDrawerAssessment(undefined)}
            assessment={drawerAssessment}
            campaignId={campaignId}
            updateMettlSchedule={updateMettlSchedule}
            loadingUpdateMettlSchedule={loadingUpdateMettlSchedule}
            updatePearsonVariation={updatePearsonVariation}
            updateMhsConfidenceInterval={updateMhsConfidenceInterval}
            updateMhsLeadershipBar={updateMhsLeadershipBar}
            updateMhsNormRegion={updateMhsNormRegion}
            updateMhsNormOption={updateMhsNormOption}
            toggleAssessmentCaching={toggleAssessmentCaching}
          />
        ) : null}
      </Col>
    </Row>
  )
}

export default AssessmentList
