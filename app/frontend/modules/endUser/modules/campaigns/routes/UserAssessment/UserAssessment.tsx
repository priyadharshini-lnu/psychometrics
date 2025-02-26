import { useEffect, FC, useContext } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Watermark, Layout, Col, Progress, Space, ProgressProps, Button, Modal,
} from 'antd'
import { PageHeader } from '@ant-design/pro-layout'
import qs from 'qs'
import { ClockCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import PassAssessment from '~/modules/survey/containers/AssessmentContainer'
import store from '~/modules/endUser/store'
import { ResourcesTabs } from '~/modules/endUser/modules/campaigns/components/ResourcesTabs'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import useAvoidMultipleEvaluation from '~/hooks/useAvoidMultipleEvaluation'
import {
  fetchAssessment, validateSession, setInvalidated,
} from '~/modules/endUser/modules/campaigns/core/userAssessment'
import { markAssessmentTimedOut } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { isProctored } from '~/utils/isProctored'
import { Notification } from '~/glint/components/CountdownTimer'
import {
  PageHeader as GlintPageHeader, CountdownTimer, MediaQueryContext, DirectionalNavigateBackIcon, FontsizeModifier,
} from '~/glint'

import styles from './UserAssessment.less'

const connector = connect((state: RootState) => ({
  userAssessment: state.campaigns.userAssessment,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
  started: state.preview.started,
}),
{
  fetchAssessment,
  validateSession,
  markAssessmentTimedOut,
  setInvalidated,
})

type Params = {
  userAssessmentId: string
}
type PropsFromRedux = ConnectedProps<typeof connector>
type UserAssessmentProps = PropsFromRedux

const { Content } = Layout
const { I18n } = window

const UserAssessmentComponent: FC<UserAssessmentProps> = ({
  userAssessment: {
    loaded, error, assessment, results,
    results: {
      user_assessment_id: userAssessmentId,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      campaign_id: campaignId,
      translations,
      remaining_campaign_time: remainingCampaignTime,
      remaining_assessment_time: remainingAssessmentTime,
      proctoring_enabled: proctoringEnabled,
      prework,
      evaluation_session_id: evaluationSessionId,
      campaign_options: campaignOptions,
    },
  }, fetchAssessment,
  preview: {
    initialized,
    enableProgress,
    type,
    started,
    extraOptions,
  },
  preview,
  markAssessmentTimedOut,
  progress,
}) => {
  const params = useParams() as Params
  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.userAssessmentId, edit)
  }, [])

  const [showInvalidSession, setShowInvalidSession] = useAvoidMultipleEvaluation(
    params.userAssessmentId, results, validateSession,
  )

  const { isMobile } = useContext(MediaQueryContext)
  const navigate = useNavigate()
  let progressBarProps:Pick<Readonly<ProgressProps>, 'type' | 'style'> = { type: 'line', style: { width: '200px' } }

  if (isMobile) { progressBarProps = { type: 'circle', style: { width: '50px' } } }

  const needsProctoring = proctoringEnabled && !prework && !isProctored()
  if (needsProctoring) {
    navigate(`/campaigns/${campaignId}`)
  }

  const enableBackButton = !extraOptions.disable_navigation_back && (!isProctored() || proctoringEnabled)
  const notificationDurations: Notification[] = [
    { timeRemaining: 3600, type: 'info' },
    { timeRemaining: 1800, type: 'warning' },
    { timeRemaining: 900, type: 'error' },
  ]
  const notificationMessage = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      return I18n.t('campaign.timer.notification_hours', { hours })
    } return I18n.t('campaign.timer.notification_minutes', { minutes })
  }

  const handleBackToAssessmentList = () => {
    window.location.href = `/campaigns/${campaignId}`
  }

  return (

    <>
      <title>{`${assessment.name || ''} - ${I18n.t('frontend.lighthouse_app')}`}</title>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c">
          <Space align="center" size="large">
            {remainingCampaignTime && (
              <CountdownTimer
                shouldAnnounceRemainingTime
                prefix={(
                  <>
                    {I18n.t('user_assessments.timer_title.campaign')}
                    {': '}
                    <ClockCircleOutlined />
                  </>
              )}
                notificationPoints={notificationDurations}
                notificationTemplate={notificationMessage}
                seconds={remainingCampaignTime}
                onFinish={() => markAssessmentTimedOut(preview)}
              />
            )}
            {remainingAssessmentTime && (
              <CountdownTimer
                shouldAnnounceRemainingTime
                prefix={(
                  <>
                    {I18n.t('user_assessments.timer_title.assessment')}
                    {': '}
                    <ClockCircleOutlined />
                  </>
            )}
                notificationPoints={notificationDurations}
                notificationTemplate={notificationMessage}
                seconds={remainingAssessmentTime}
                onFinish={() => markAssessmentTimedOut(preview)}
              />
            )}
          </Space>
        </Col>
        <Col span={4} className="ta-e">
          <Space>
            <FontsizeModifier />
            {availableTranslations
              && availableTranslations.length > 1
              && (
              <LangDropdownWithChangeUrl
                currentLocale={selectedLanguage.code}
                locales={availableTranslations || []}
              />
              )
            }
          </Space>
        </Col>
      </GlintPageHeader>

      <Content className={styles.pageContent}>
        <Watermark
          content={campaignOptions?.show_watermark ? campaignOptions.watermark_content : ''}
          font={{ color: 'rgba(0,0,0,0.3)' }}
          gap={[10, 0]}
          rotate={-15}
        >
          {loaded ? (
            <>
              <PageHeader
                className={styles.campaignHeader}
                ghost={false}
                title={(
                  <Space>
                    {enableBackButton
                      && (
                      <Button
                        onClick={handleBackToAssessmentList}
                        size="small"
                        type="text"
                        ghost
                        aria-label={I18n.t('frontend.aria.back_to_tasks')}
                      >
                        <DirectionalNavigateBackIcon className={styles.backIcon} />
                      </Button>
                      )}
                    <h1 className={styles.campaignDropdown}>
                      {assessment.name}
                    </h1>
                  </Space>
              )}
                extra={type !== 'preview_block' && enableProgress && started && (
                <Progress
                  strokeColor="#fff"
                  className={styles.progressStatus}
                  key="3"
                  percent={progress}
                  aria-label={I18n.t('user_assessments.progress_label')}
                  {...progressBarProps}
                />
                )}
              />
              <div className={styles.assessmentContainer}>
                {showInvalidSession && (
                <Modal
                  title={I18n.t('errors.invalid_session_title')}
                  open={showInvalidSession}
                  cancelText={I18n.t('common.actions.close')}
                  okText={I18n.t('common.actions.back_to_dashboard')}
                  closable={false}
                  maskClosable={false}
                  onCancel={() => {
                    setShowInvalidSession(false)
                  }}
                  onOk={() => { window.location.href = `/campaigns/${campaignId}` }}
                  centered
                >
                  {I18n.t('assessments.page.invalid_session.description')}
                </Modal>
                )}
                {loaded && !error && (
                <ResourcesTabs assessmentStarted={started} assessment={assessment}>
                  <PassAssessment
                    id="pass_assessment"
                    type="pass_assessment"
                    initialized={initialized}
                    data={assessment}
                    result={results}
                    locales={translations}
                    dashboardUrl={`/assessment_completed/${campaignId}`}
                    resultsUrl={`/user_assessments/${userAssessmentId}/users_results/${results.id}`}
                    selectedLocale={selectedLanguage && selectedLanguage.code}
                    rstore={store}
                    valuationSessionId={evaluationSessionId}
                    renderedByEnduser
                  />
                </ResourcesTabs>
                )}
              </div>
            </>
          ) : <PageContentSkeleton />}
        </Watermark>
      </Content>
    </>
  )
}

export const UserAssessment = connector(UserAssessmentComponent)
