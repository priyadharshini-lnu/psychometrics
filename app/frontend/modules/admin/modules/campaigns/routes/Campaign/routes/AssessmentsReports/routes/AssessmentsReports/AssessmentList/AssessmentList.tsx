import React, { useState } from 'react'
import {
  Table, Row, Col, Switch, Typography, App,
} from 'antd'

import { MoreOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { getActionsMenuProps } from './getActionsMenuProps'
import { PropsFromRedux } from './connect'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { secondsToDayHoursAndMinutes } from '~/utils/time'
import { DetailsDrawer } from './DetailsDrawer'

const { Column } = Table
const { I18n } = window

export type Props = PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments: {
    list,
    permissions,
  },
  openModal,
  rescoreResponses,
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
  updateWorkshopActivity,
  toggleRequireScheduling,
  toggleAutoAssign,
  normalizeFactorScores,
  loadingUpdateMettlSchedule,
  updatePearsonVariation,
}) => {
  const [drawerAssessment, setDrawerAssessment] = useState<Assessment | undefined>()

  const { projectId, campaignId } = useParams() as { projectId: string, campaignId: string }
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)
  const { message } = App.useApp()

  function handleWorkshopActivitySwitchToggle (assessment: Assessment, parsedCampaignId: number, checked: boolean) {
    if (checked) {
      openModal('WorkshopActivityDurationFormModal', {
        assessment, updateWorkshopActivity, parsedCampaignId, checked,
      })
    } else {
      updateWorkshopActivity(parsedCampaignId, assessment.id, { workshopActivity: checked })
    }
  }

  return (
    <Row>
      <Col span={24}>
        <Table className="mtm" rowKey="id" dataSource={list} pagination={false}>
          <Column
            title={I18n.t('common.column.id')}
            dataIndex="assessmentId"
            key="assessmentId"
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessment_name')}
            key="name"
            dataIndex="name"
            render={(text, record: Assessment) => (
              <a onClick={() => setDrawerAssessment(record)}>{text}</a>
            )}
          />
          <Column
            title={I18n.t('campaign_assessment.column.auto_assign')}
            key="autoAssign"
            render={({ autoAssign, id }) => (
              <Switch
                checked={autoAssign}
                onChange={() => toggleAutoAssign(parsedCampaignId, id, !autoAssign)}
              />
            )}
          />
          <Column
            title={I18n.t('common.column.require_scheduling')}
            key="requireScheduling"
            render={({ requireScheduling, id }) => (
              <Switch
                checked={requireScheduling}
                onChange={() => {
                  toggleRequireScheduling(parsedCampaignId, id, !requireScheduling)
                }}
              />
            )}
          />
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

              const open = (response?:{ universalLink: string, enableUniversalLinks: boolean }) => {
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
            render={({ id, prework }) => (
              <Switch
                checked={prework}
                onChange={checked => updatePrework(parsedCampaignId, id, checked)}
              />
            )}
          />
          <Column
            title={I18n.t('campaign_assessment.column.assessment_center_activity')}
            key="workshopActivity"
            width={150}
            render={assessment => (
              <>
                <Switch
                  checked={assessment.workshopActivity}
                  onChange={checked => handleWorkshopActivitySwitchToggle(assessment, parsedCampaignId, checked)}
                />
                {(assessment.workshopActivity && assessment.workshopActivityDuration) ? (
                  <Typography.Text>
                    {` ${secondsToDayHoursAndMinutes(assessment.workshopActivityDuration * 60)}`}
                  </Typography.Text>
                ) : null}
              </>
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
                    rescoreResponses: () => rescoreResponses(parsedCampaignId, assessment.id),
                    exportRawResults,
                    exportScoringResults,
                    exportNormedResults,
                    exportRawFactorScores,
                    exportOccupations,
                    normalizeFactorScores: () => normalizeFactorScores(parsedCampaignId, assessment.id),
                    exportExternalResults,
                    updateExternalConfig,
                    message,
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
          />
        ) : null}
      </Col>
    </Row>
  )
}

export default AssessmentList
