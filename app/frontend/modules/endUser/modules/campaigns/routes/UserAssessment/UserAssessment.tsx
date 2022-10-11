import React, { useEffect, FC, useContext } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { push } from 'connected-react-router'
import {
  Layout, PageHeader, Col, Progress, Space, ProgressProps,
} from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons'
import qs from 'qs'

import { Language } from 'modules/endUser/modules/campaigns/components/Language'
import { PageHeader as GlintPageHeader, CountdownTimer, MediaQueryContext } from 'glint'
import { Notification } from 'glint/components/CountdownTimer'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import { isRtl } from 'utils/locales'
import { isInsideIframe } from 'utils/isInsideIframe'
import store from 'modules/user/store'
import { ResourcesTabs } from 'modules/endUser/modules/campaigns/components/ResourcesTabs'
import { PageContentSkeleton } from 'modules/endUser/modules/campaigns/components/PageContentSkeleton'

import {
  fetchAssessment,
} from 'modules/user/modules/campaigns/core/userAssessment'
import { markAssessmentTimedOut } from 'core/preview/FlowProcessor/actions'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import { RootState } from 'modules/user/core/rootReducers'

import styles from './UserAssessment.less'

const connector = connect((state: RootState) => ({
  userAssessment: state.campaigns.userAssessment,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
  started: state.preview.started,
}),
{
  fetchAssessment,
  markAssessmentTimedOut,
  push,
})

type Params = {
  userAssessmentId: string
}
type PropsFromRedux = ConnectedProps<typeof connector>
type UserAssessmentProps = PropsFromRedux & RouteComponentProps<Params>

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
    },
  }, fetchAssessment,
  match: { params },
  preview: {
    initialized,
    enableProgress,
    type,
    started,
  },
  preview,
  markAssessmentTimedOut,
  progress,
}) => {
  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.userAssessmentId, edit)
  }, [])
  const { isMobile } = useContext(MediaQueryContext)
  let progressBarProps:Pick<Readonly<ProgressProps>, 'type' | 'style'> = { type: 'line', style: { width: '200px' } }
  if (isMobile) { progressBarProps = { type: 'circle', style: { width: '50px' } } }

  const needsProctoring = proctoringEnabled && !isInsideIframe()
  if (needsProctoring) return <Redirect to={`/campaigns/${campaignId}`} />

  const enableBackButton = !isInsideIframe() || proctoringEnabled
  const notificationDurations: Notification[] = [
    { completionPercentage: 50, type: 'info' },
    { completionPercentage: 75, type: 'warning' },
    { completionPercentage: 90, type: 'error' },
  ]
  const notificationMessage = (minutes: number, seconds: number) => (
    I18n.t('campaign.timer.notification', { minutes, seconds })
  )

  const rtl = isRtl(I18n.uiLocale)
  return (
    <>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c">
          <Space align="center" size="large">
            {remainingCampaignTime && (
            <CountdownTimer
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
          {availableTranslations
              && availableTranslations.length > 1
              && (
              <Language
                selectedLanguage={selectedLanguage}
                availableTranslations={availableTranslations || []}
              />
              )
            }
        </Col>
      </GlintPageHeader>
      <Content className={styles.pageContent}>
        {loaded ? (
          <>
            <PageHeader
              className={styles.campaignHeader}
              onBack={() => { window.location.href = `/campaigns/${campaignId}` }}
              backIcon={enableBackButton
            && (rtl ? <ArrowRightOutlined className={styles.backIcon} />
              : <ArrowLeftOutlined className={styles.backIcon} />)}
              ghost={false}
              title={(
                <div className={styles.campaignDropdown}>
                  {assessment.name}
                </div>
          )}
              extra={type !== 'preview_block' && enableProgress && started && (
              <Progress
                strokeColor="#fff"
                className={styles.progressStatus}
                key="3"
                percent={progress}
                {...progressBarProps}
              />
              )}
            />
            <div className={styles.assessmentContainer}>
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
                />
              </ResourcesTabs>
              )}
            </div>
          </>
        ) : <PageContentSkeleton />}

      </Content>
    </>
  )
}

export const UserAssessment = connector(UserAssessmentComponent)
