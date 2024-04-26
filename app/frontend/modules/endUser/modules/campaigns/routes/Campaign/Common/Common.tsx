import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import {
  Layout, Row, Col, Alert, Button, Result, Typography, Space, App,
} from 'antd'
import {
  InfoCircleOutlined,
  PlayCircleOutlined, ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined,
} from '@ant-design/icons'
import cs from 'classnames'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { STATUSES } from '~/constants/campaign'

import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  continueCampaign,
  beginCampaign,
  reset as resetCampaign,
  resetPracticeCampaign,
} from '~/modules/endUser/modules/campaigns/core/campaign'
import { loginHogan } from '~/modules/endUser/modules/campaigns/core/campaigns'
import { acceptPolicy } from '~/modules/endUser/modules/campaigns/core/project'

import { SafeHTML } from '~/components/SafeHTML'
import { isProctored } from '~/utils/isProctored'
import { ProgressStatus, DirectionalArrowIcon } from '~/glint'
import { CampaignPageHeader } from './CampaignPageHeader'
import { AssessmentsContainer } from './AssessmentsContainer'
import { InstructionsPanel } from './InstructionsPanel'
import { AssessmentCardContainer } from './AssessmentCardContainer'
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
    resetPracticeCampaign,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type CommonComponentProps = RouteComponentProps & PropsFromRedux

const { Title } = Typography
const { Content } = Layout
const { I18n } = window


const CommonComponent: FC<CommonComponentProps> = ({
  campaign,
  campaign: {
    campaignUser, groups,
    campaignUser: { expiryDate },
  },
  beginCampaign,
  continueCampaign,
  resetPracticeCampaign,
}) => {
  const { modal, message } = App.useApp()
  const {
    isTimedCampaign,
    fixedTimed,
    campaignsCount,
    campaignOptions: {
      instructionsEnabled, instructions, proctoringEnabled, integrationType,
    },
    campaignTime,
  } = campaign

  const needsProctoring = proctoringEnabled && !isProctored()
  const campaignClosed = campaign.status === STATUSES.CLOSED
  const counters = _.countBy(campaign.userAssessments, 'status')
  // TODO: We can check completion_status here. Also need to take care for assessment timed_out status when we add it
  const allAssessmentsComplete = counters.completed === campaign.userAssessments.length
  const allPreworkIsComplete = _.find(
    campaign.userAssessments, ua => ua.prework && ua.status !== 'completed',
  ) === undefined
  let ungrouped = _.compact(
    campaign.ungroupedAssessmentsIds.map(id => _.find(campaign.userAssessments, { assessmentId: id })),
  )
  const hasAssessments = !!campaign.userAssessments.length
  const hasStartedCampaign = !!campaignUser.startedAt
  const campaignUserTimedOut = campaignUser.status === 'timed_out'
  const isCampaignInterrupted = campaignUser.status === 'interrupted'
  const hasNoExpiryDateForTimedCampaign = isTimedCampaign && !expiryDate && campaignUser.status === 'in_progress'
  const campaignClosedForUser = campaignClosed
  || campaignUserTimedOut || (isTimedCampaign && campaignUser.status === 'completed')

  const canNotStartPrework = campaignClosedForUser || campaignUser.status === 'completed'
  const canNotStartAssessment = needsProctoring
    || (fixedTimed && !hasStartedCampaign)
    || campaignClosedForUser
    || campaignUser.status === 'completed'
    || isCampaignInterrupted
    || campaignUserTimedOut
    || hasNoExpiryDateForTimedCampaign
  const canBeginCampaign = !campaignClosedForUser && hasAssessments && !hasStartedCampaign && !allAssessmentsComplete
    && fixedTimed && !isCampaignInterrupted
  // eslint-disable-next-line max-len
  const canContinueCampaign = ((needsProctoring && !canBeginCampaign) || isCampaignInterrupted || hasNoExpiryDateForTimedCampaign)
    && !campaignClosedForUser && !allAssessmentsComplete && !campaignUserTimedOut && fixedTimed


  const allCampaignLevelAssessmentIds = _.flatten([
    ...groups.map(g => g.campaignAssessmentIds),
    campaign.ungroupedAssessmentsIds,
  ])

  const ungroupedAssessments = campaign.userAssessments.filter(
    ua => !_.includes(allCampaignLevelAssessmentIds, ua.assessmentId),
  )
  ungrouped = [...ungrouped, ...ungroupedAssessments]

  const campaignStartInstruction = () => {
    const messages = [I18n.t('campaign.instruction_modal.campaign_start_instruction', { minutes: campaignTime })]
    if (proctoringEnabled) { messages.push(I18n.t('campaign.instruction_modal.common_proctoring_instructions')) }

    if (integrationType === 'ldb') { messages.push(I18n.t('campaign.instruction_modal.lockdown_browser_instruction')) }

    messages.push(I18n.t('campaign.instruction_modal.campaign_start_final_instructions'))

    return (
      messages.map(message => <Typography.Paragraph><SafeHTML html={message} /></Typography.Paragraph>)
    )
  }

  const startCampaignActivities = () => {
    const func = canBeginCampaign ? beginCampaign : continueCampaign
    func(campaignUser.id).then(
      ({ response: { examusSessionUrl } }: ApiActionResponse<{ examusSessionUrl?: string }>) => {
        if (proctoringEnabled && examusSessionUrl) { window.location.href = examusSessionUrl }
      },
    ).catch((error) => {
      message.error(error)
    })
  }


  const handleStartCampaignActivities = () => {
    if (!fixedTimed) { return startCampaignActivities() }

    modal.info({
      icon: false,
      title: null,
      content: campaignStartInstruction(),
      okText: I18n.t('common.actions.start'),
      closable: true,
      width: 600,
      onOk () {
        startCampaignActivities()
      },
    })
  }

  const handleResetPracticeCampaign = (campaignId) => {
    modal.confirm({
      title: I18n.t('campaign.restart_practice'),
      content: I18n.t('campaign.restart_practice_confirmation'),
      onOk () {
        resetPracticeCampaign(campaignId).then(() => {
          message.success(I18n.t('campaign.restart_practice_success'))
        }).catch((error) => {
          message.error(error)
        })
      },
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
        <Row>
          <Col span={24} className={cs({ disabled: canNotStartAssessment })}>
            {campaignClosedForUser && (
            <div className="mvm font-bold">
              <AssessmentCardContainer>
                <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
              </AssessmentCardContainer>
            </div>
            )}
            <div className={styles.tasksContainer}>
              <AssessmentCardContainer>
                <Row>
                  <Col span={24} style={{ paddingInlineStart: '14px' }}>
                    {canBeginCampaign && (
                      <>
                        <Title className={styles.beginText} level={4}>
                          {I18n.t('campaign.begin')}
                        </Title>
                        <Button
                          size="small"
                          type="primary"
                          onClick={handleStartCampaignActivities}
                          disabled={!allPreworkIsComplete}
                        >
                          {I18n.t('campaign.begin')}
                          {' '}
                          <DirectionalArrowIcon />
                        </Button>
                      </>
                    )}
                    {campaign.practiceCampaign && hasStartedCampaign && !isProctored() && (
                      <>
                        <Title className={styles.beginText} level={4}>
                          {I18n.t('campaign.restart_practice')}
                        </Title>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleResetPracticeCampaign(campaign.id)}
                          icon={<ReloadOutlined />}
                        >
                          {I18n.t('campaign.restart_practice')}
                        </Button>
                      </>
                    )}
                    {canContinueCampaign && (
                      <>
                        <Title className={styles.beginText} level={4}>
                          {I18n.t('campaign.continue')}
                        </Title>
                          {/* {<p>This is text will come from backend</p>} */}
                        <Button
                          size="small"
                          type="primary"
                          onClick={handleStartCampaignActivities}
                          disabled={!allPreworkIsComplete}
                        >
                          {I18n.t('campaign.continue')}
                          {' '}
                          <DirectionalArrowIcon />
                        </Button>
                      </>
                    )}
                    {fixedTimed && !allPreworkIsComplete && (canBeginCampaign || canContinueCampaign) && (
                      <div className="mt-1">
                        <Space>
                          <InfoCircleOutlined />
                          <Typography.Text type="secondary">
                            {I18n.t('campaign.begin_btn_msg_before_prework')}
                          </Typography.Text>
                        </Space>
                      </div>
                    )}
                  </Col>
                </Row>
              </AssessmentCardContainer>
              <AssessmentsContainer
                groups={groups}
                ungrouped={ungrouped}
                campaign={campaign}
                canNotStartPrework={canNotStartPrework}
                canNotStartAssessment={canNotStartAssessment}
                campaignNotStarted={canBeginCampaign || canContinueCampaign}
              />
            </div>
          </Col>
        </Row>
      </>
    </Content>
  )
}

export const Common = connector(CommonComponent)
