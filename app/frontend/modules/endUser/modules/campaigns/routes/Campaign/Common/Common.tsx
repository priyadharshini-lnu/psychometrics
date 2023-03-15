import React, { FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import {
  Layout, Row, Col, Alert, Button, Result, Typography,
} from 'antd'
import {
  PlayCircleOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import { STATUSES } from '~/constants/campaign'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  continueCampaign,
  beginCampaign,
  reset as resetCampaign,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import { loginHogan } from '~/modules/endUser/modules/campaigns/core/campaigns'
import { acceptPolicy } from '~/modules/endUser/modules/campaigns/core/project'

import { SafeHTML } from '~/components/SafeHTML'
import { isInsideIframe } from '~/utils/isInsideIframe'
import { ProgressStatus, DirectionalArrowIcon } from '~/glint'
import { CampaignPageHeader } from './CampaignPageHeader'
import { AssessmentsContainer } from './AssessmentsContainer'
import { InstructionsPanel } from './InstructionsPanel'
import styles from './styles.less'

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
    instructions: state.campaigns.campaign.instructions,
    currentUser: state.currentUser,
    privacyConsentRequired: state.campaigns.campaign?.privacyConsentRequired,
  }),
  {
    beginCampaign,
    continueCampaign,
    resetCampaign,
    loginHogan,
    acceptPolicy,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type CommonComponentProps = RouteComponentProps & PropsFromRedux

const { Title } = Typography
const { Content } = Layout
const { I18n } = window


const CommonComponent: FC<CommonComponentProps> = ({
  campaign,
  campaign: { campaignUser, groups },
  loginHogan,
  acceptPolicy,
  beginCampaign,
  continueCampaign,
  privacyConsentRequired,
}) => {
  const [showError, setShowError] = useState(false)
  const {
    isTimedCampaign,
    campaignsCount,
    campaignUser: { expiryDate },
    campaignOptions: { instructionsEnabled, instructions, proctoringEnabled },
  } = campaign

  const needsProctoring = proctoringEnabled && !isInsideIframe()
  const campaignClosed = campaign.status === STATUSES.CLOSED
  const counters = _.countBy(campaign.userAssessments, 'status')
  // TODO: We can check completion_status here. Also need to take care for assessment timed_out status when we add it
  const allAssessmentsComplete = counters.completed === campaign.userAssessments.length
  let ungrouped = _.compact(
    campaign.ungroupedAssessmentsIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
  )
  const hasAssessments = !!campaign.userAssessments.length
  const hasStartedCampaign = !!campaignUser.startedAt
  const campaignUserTimedOut = campaignUser.status === 'timed_out'
  const isCampaignInterrupted = campaignUser.status === 'interrupted'
  const canNotStartAssessment = needsProctoring
    || !hasStartedCampaign
    || campaignClosed
    || campaignUser.status === 'completed'
    || isCampaignInterrupted
    || campaignUserTimedOut
  const canBeginCampaign = !campaignClosed && hasAssessments && !hasStartedCampaign && !allAssessmentsComplete
  const canContinueCampaign = ((needsProctoring && !canBeginCampaign) || isCampaignInterrupted)
    && !campaignClosed && !allAssessmentsComplete && !campaignUserTimedOut
  const showCampaignClosedMessage = campaignClosed
  || campaignUserTimedOut || (isTimedCampaign && campaignUser.status === 'completed')


  const allCampaignLevelAsssementIds = _.flatten([
    ...groups.map(g => g.campaignAssessmentIds),
    campaign.ungroupedAssessmentsIds,
  ])

  const ungroupedAssessments = campaign.userAssessments.filter(
    ua => !_.includes(allCampaignLevelAsssementIds, ua.assessmentId),
  )
  ungrouped = [...ungrouped, ...ungroupedAssessments]

  const handleBeginCampign = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beginCampaign(campaignUser.id).then(({ response: { examusSessionUrl } }: any) => {
      if (proctoringEnabled && examusSessionUrl) { window.location = examusSessionUrl }
    }).catch((error) => {
      setShowError(error)
    })
  }

  const handleContinueCampaign = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    continueCampaign(campaignUser.id).then(({ response: { examusSessionUrl } }: any) => {
      if (proctoringEnabled && examusSessionUrl) { window.location = examusSessionUrl }
    }).catch((error) => {
      setShowError(error)
    })
  }

  const statusElement = (
    <Row gutter={[64, 0]}>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.not_started')}
          StatusIcon={PlayCircleOutlined}
          count={counters.not_started || 0}
        />
      </Col>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.in_progress')}
          StatusIcon={ClockCircleOutlined}
          count={counters.in_progress || 0}
        />
      </Col>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.completed')}
          StatusIcon={CheckCircleOutlined}
          count={counters.completed || 0}
        />
      </Col>
    </Row>
  )

  return (
    <Content>
      <>
        {showCampaignClosedMessage && (
          <div className="mvm font-bold">
            <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
          </div>
        )}
        <CampaignPageHeader extra={statusElement} activeCampaignId={campaign.id} />
        <Row>
          <Col span={24}>
            {!campaignClosed && allAssessmentsComplete ? (
              <Result
                status="success"
                title={I18n.t('campaign.thank_you_for_time')}
                subTitle={
                      campaignsCount > 1
                        ? I18n.t('campaign.all_activities_are_completed_multiple')
                        : I18n.t('campaign.all_activities_are_completed')
                    }
                extra={
                      campaignsCount > 1 && (
                        <Button href="/" type="link">
                          {I18n.t('campaign.goto_dashboard')}
                        </Button>
                      )
                    }
                className={styles.resultContainer}
              />
            ) : (
              instructionsEnabled && (
              <InstructionsPanel
                description={<SafeHTML html={instructions} config="adminRichText" />}
                title={I18n.t('campaign.instructions.heading')}
                heightLimit={200}
              />
              )
            )}
          </Col>
        </Row>
        <Row className={styles.cardsContainer}>
          <Col span={24} className={cs({ disabled: canNotStartAssessment })}>
            <div className={styles.tasksContainer}>
              <Row>
                <Col span={24} style={{ paddingInlineStart: '14px' }}>
                  {canBeginCampaign && (
                    <>
                      <Title className={styles.beginText} level={4}>
                        {I18n.t('campaign.begin')}
                      </Title>
                        {/* {<p>This is text will come from backend</p>} */}
                      <Button
                        size="small"
                        type="primary"
                        onClick={handleBeginCampign}
                        disabled={proctoringEnabled && showError}
                      >
                        {I18n.t('campaign.begin')}
                        {' '}
                        <DirectionalArrowIcon />
                      </Button>
                    </>
                  )}
                  {proctoringEnabled
                      && showError
                      && <Alert message={I18n.t('licenses.not_enough_proctoring_credits')} type="error" />
                  }
                  {canContinueCampaign && (
                    <>
                      <Title className={styles.beginText} level={4}>
                        {I18n.t('campaign.continue')}
                      </Title>
                        {/* {<p>This is text will come from backend</p>} */}
                      <Button
                        size="small"
                        type="primary"
                        onClick={handleContinueCampaign}
                        disabled={proctoringEnabled && showError}
                      >
                        {I18n.t('campaign.continue')}
                        {' '}
                        <DirectionalArrowIcon />
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
              <AssessmentsContainer
                groups={groups}
                ungrouped={ungrouped}
                campaign={campaign}
                loginHogan={loginHogan}
                canNotStartAssessment={canNotStartAssessment}
                campaignNotStarted={canBeginCampaign || canContinueCampaign}
                acceptPolicy={acceptPolicy}
                isTimedCampaign={isTimedCampaign}
                expiryDate={expiryDate}
                privacyConsentRequired={privacyConsentRequired}
              />
            </div>
          </Col>
        </Row>
      </>
    </Content>
  )
}

export const Common = connector(CommonComponent)
