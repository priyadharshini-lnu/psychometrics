import React, { useState, useEffect } from 'react'
import {
  Layout, Col, ConfigProvider, Progress,
} from 'antd'
import Cookies from 'js-cookie'
import { connect, ConnectedProps } from 'react-redux'
import { ClockCircleOutlined } from '@ant-design/icons'

import { ProgressProps } from 'antd/lib/progress'
import { SubHeader } from '~/modules/endUser/modules/campaigns/components/SubHeader'
import { Language } from '~/modules/endUser/modules/campaigns/components/Language'
import { markAssessmentTimedOut } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import PassAssessment from '~/modules/survey/containers/AssessmentContainer'
import store from '~/modules/endUser/store'
import { ResourcesTabs } from '~/modules/endUser/modules/campaigns/components/ResourcesTabs'
import { useMedia } from '~/modules/endUser/rootHooks'
import { PageHeader as GlintPageHeader, CountdownTimer } from '~/glint'
import Confirm from './Confirm'

import styles from './Common.less'

const connector = connect(
  (state: RootState) => ({
    preview: state.preview,
    anonym: state.anonym,
    progress: getProgress(state.preview),
  }),
  {
    markAssessmentTimedOut,
  },
)
const { Content } = Layout
const { I18n } = window
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const CommonComponent: React.FC<Props> = ({
  anonym: {
    assessment, results,
    results: {
      id,
      campaign_id: campaignId,
      user_assessment_id: userAssessmentId,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      translations,
      current_step: currentStep,
      current_element: currentElement,
      remaining_assessment_time: remainingAssessmentTime,
    },
  },
  preview,
  preview: { enableProgress, initialized, started },
  progress,
  markAssessmentTimedOut,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const isMaxSm = useMedia('max-sm')
  let progressBarProps: ProgressProps = { type: 'line', style: { width: '200px' } }
  if (isMaxSm) { progressBarProps = { type: 'circle', width: 50 } }

  useEffect(() => {
    if (currentElement > 0 || currentStep > 0) {
      setShowConfirm(true)
    }
  }, [results])

  if (!assessment) { return null }

  const reset = () => {
    const { hostname } = location
    Cookies.remove('tte-anonym-payload', { domain: `.${hostname}`, path: '/' })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // Param to be passed to force reload in firefox - https://developer.mozilla.org/en-US/docs/Web/API/Location/reload
    location.reload(true)
  }

  return (
    <>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c">
          {remainingAssessmentTime && (
            <CountdownTimer
              prefix={(
                <>
                  {I18n.t('user_assessments.timer_title.assessment')}
                  {': '}
                  <ClockCircleOutlined />
                </>
              )}
              seconds={remainingAssessmentTime}
              onFinish={() => markAssessmentTimedOut(preview)}
            />
          )}
        </Col>
        <Col span={4} className="ta-e">
          {availableTranslations
              && availableTranslations.length > 1
              && <Language selectedLanguage={selectedLanguage} availableTranslations={availableTranslations || []} />
            }
        </Col>
      </GlintPageHeader>
      <Content className={styles.pageContent}>
        <SubHeader
          title={assessment.name}
          extra={enableProgress
            && (
            <Progress
              strokeColor="#fff"
              className={styles.progressStatus}
              percent={progress}
              {...progressBarProps}
            />
            )}
        />
        <ConfigProvider direction={selectedLanguage && selectedLanguage.direction}>
          <div className={styles.assessmentContainer}>
            <ResourcesTabs assessmentStarted={started} assessment={assessment}>
              <PassAssessment
                id="pass_assessment"
                type="pass_assessment"
                initialized={initialized}
                resultsUrl={`/user_assessments/${userAssessmentId}/users_results/${id}`}
                data={assessment}
                result={results}
                dashboardUrl={`/campaigns/${campaignId}`}
                locales={translations}
                selectedLocale={selectedLanguage && selectedLanguage.code}
                rstore={store}
                isAnonymousAssessment="true"
                renderedByEnduser
              />
            </ResourcesTabs>
          </div>
        </ConfigProvider>
        <Confirm open={showConfirm} onReset={reset} onOk={() => setShowConfirm(false)} />
      </Content>
    </>
  )
}

export const Common = connector(CommonComponent)
