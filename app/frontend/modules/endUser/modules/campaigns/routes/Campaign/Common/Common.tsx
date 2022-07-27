import React, { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import {
  Layout, Row, Col, Alert, Button, Result, Typography,
} from 'antd'
import { RightOutlined } from '@ant-design/icons'
import { STATUSES } from 'constants/campaign'
import cs from 'classnames'

import { RootState } from 'modules/user/core/rootReducers'
import {
  fetchCampaign,
  continueCampaign,
  beginCampaign,
  reset as resetCampaign,
} from 'modules/user/modules/campaigns/core/campaign'
import { loginHogan } from 'modules/user/modules/campaigns/core/campaigns'
import { acceptPolicy } from 'modules/user/modules/campaigns/core/project'

import { isInsideIframe } from 'utils/isInsideIframe'
import { SafeHTML } from 'components/SafeHTML'
import { NewHeader } from './NewHeader'
import { AssessmentsContainer } from './AssessmentsContainer'
import { InstructionsPanel } from './InstructionsPanel'
import styles from './styles.less'

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
    instructions: state.campaigns.campaign.instructions,
    currentUser: state.currentUser,
  }),
  {
    fetchCampaign,
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
}) => {
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

  return (
    <Content className="fluid-container common-campaign">
      <>
        {showCampaignClosedMessage && (
          <div className="mvm font-bold">
            <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
          </div>
        )}
        <NewHeader counters={counters} activeCampaignId={campaign.id} />
        <Row className={styles.cardsContainer}>
          <Col span={24} className={cs({ disabled: canNotStartAssessment })}>
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
                      description={<SafeHTML html={instructions} />}
                      title={I18n.t('campaign.instructions.heading')}
                      heightLimit={100}
                    />
                  )
                )}
              </Col>
            </Row>
            <div className={styles.tasksContainer}>
              {canBeginCampaign && (
                <Row>
                  <Col span={24} style={{ paddingLeft: '14px' }}>
                    <Title className={styles.beginText} level={4}>
                      {I18n.t('campaign.begin')}
                    </Title>
                    {/* {<p>This is text will come from backend</p>} */}
                    <Button size="small" type="primary">
                      {I18n.t('campaign.begin')}
                      {' '}
                      <RightOutlined />
                    </Button>
                  </Col>
                </Row>
              )}
              <AssessmentsContainer
                groups={groups}
                ungrouped={ungrouped}
                campaign={campaign}
                loginHogan={loginHogan}
                canNotStartAssessment={canNotStartAssessment}
                acceptPolicy={acceptPolicy}
                isTimedCampaign={isTimedCampaign}
                expiryDate={expiryDate}
              />
            </div>
          </Col>
        </Row>
      </>
    </Content>
  )
}

export const Common = connector(CommonComponent)
