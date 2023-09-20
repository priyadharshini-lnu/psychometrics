import React from 'react'
import {
  Table, Row, Col, Switch, Typography,
} from 'antd'

import { MoreOutlined } from '@ant-design/icons'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import ConditionalDropdown from '~/components/ConditionalDropdown'
import { ActionsMenu } from './ActionsMenu'
import { PropsFromRedux } from './connect'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { secondsToDayHoursAndMinutes } from '~/utils/time'

const { Column } = Table
const { I18n } = window

interface OwnProps {
  match: {
    params: {
      projectId: string
      campaignId: string
    }
  }
}

export type Props = RouteComponentProps & OwnProps & PropsFromRedux

const AssessmentList: React.FC<Props> = ({
  assessments: {
    list,
    permissions,
  },
  match: { params: { projectId, campaignId } },
  openModal,
  activateUniversalLink,
  rescoreResponses,
  exportRawResults,
  exportScoringResults,
  exportNormedResults,
  exportRawFactorScores,
  exportExternalResults,
  updateExternalConfig,
  updatePrework,
  updateWorkshopActivity,
}) => {
  const parsedProjectId = parseInt(projectId, 10)
  const parsedCampaignId = parseInt(campaignId, 10)

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
            key="assessorFormName"
            render={({
              assessorFormName, id, isExternal,
            }) => {
              if (isExternal) {
                return I18n.t('common.text.na')
              }
              return (
                permissions.updateAssessorForm ? (
                  <a
                    onClick={
                      () => openModal('UpdateAssessorFormModal',
                        { projectId: parsedProjectId, campaignId: parsedCampaignId, campaignAssessmentId: id })
                    }
                  >
                    {assessorFormName || I18n.t('common.text.na')}
                  </a>
                ) : assessorFormName || I18n.t('common.text.na')
              )
            }}
          />

          <Column
            title={I18n.t('campaign_assessment.column.locales')}
            key="availableLocales"
            render={({
              availableLocales, id, isExternal, allLocales,
            }) => {
              if (isExternal) {
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
              enableUniversalLinks, universalLink, id, isExternal,
            }) => {
              if (enableUniversalLinks && !isExternal) {
                return (
                  <a
                    onClick={
                      () => openModal('UniversalLinkModal',
                        {
                          projectId: parsedProjectId,
                          campaignId: parsedCampaignId,
                          campaignAssessmentId: id,
                          universalLink,
                          manageUniversalLink: permissions.enableUniversalLink,
                        })
                    }
                  >
                    {permissions.enableUniversalLink ? I18n.t('frontend.manage') : 'Show'}
                  </a>
                )
              }
              return (
                permissions.enableUniversalLink && !isExternal ? (
                  <a onClick={() => activateUniversalLink(campaignId, id)}>{I18n.t('frontend.activate')}</a>
                ) : I18n.t('common.text.na')
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
                  ActionsMenu({
                    assessment,
                    campaignId: parsedCampaignId,
                    openModal,
                    rescoreResponses: () => rescoreResponses(parsedCampaignId, assessment.id),
                    exportRawResults,
                    exportScoringResults,
                    exportNormedResults,
                    exportRawFactorScores,
                    exportExternalResults,
                    updateExternalConfig,
                  }) as React.ReactElement
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
      </Col>
    </Row>
  )
}

export default withRouter(AssessmentList)
