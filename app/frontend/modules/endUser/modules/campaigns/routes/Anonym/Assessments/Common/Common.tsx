import React, { useState, useEffect } from 'react'
import {
  Layout, Col, ConfigProvider, Progress, Watermark, Space,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { ProgressProps } from 'antd/es/progress'
import { ClockCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { SubHeader } from '~/modules/endUser/modules/campaigns/components/SubHeader'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import { markAssessmentTimedOut } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { getProgress } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import PassAssessment from '~/modules/survey/containers/AssessmentContainer'
import store from '~/modules/endUser/store'
import { ResourcesTabs } from '~/modules/endUser/modules/campaigns/components/ResourcesTabs'
import { useMedia } from '~/modules/endUser/rootHooks'
import { PageHeader as GlintPageHeader, CountdownTimer, FontsizeModifier } from '~/glint'
import Confirm from './Confirm'
import AreadyCompletedModal from './AreadyCompletedModal'

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
      current_page: currentPage,
      current_element: currentElement,
      remaining_assessment_time: remainingAssessmentTime,
      campaign_user: {
        status,
      },
      campaign_options: campaignOptions,
    },
  },
  preview,
  preview: {
    enableProgress, initialized, started, extraOptions,
  },
  progress,
  markAssessmentTimedOut,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAlreadyCompletedModal, setShowAlreadyCompletedModal] = useState(false)
  const isMaxSm = useMedia('max-sm')
  let progressBarProps: ProgressProps = { type: 'line', style: { width: '200px' } }
  if (isMaxSm) { progressBarProps = { type: 'circle', width: 50 } }

  useEffect(() => {
    if (status && status === 'completed') {
      setShowAlreadyCompletedModal(true)
      return
    }

    if (currentElement > 0 || currentPage > 0) {
      setShowConfirm(true)
    }
  }, [results])

  if (!assessment) { return null }

  const reset = () => {
    window.location.href = `${window.location.pathname}/restart${window.location.search}`
  }

  const hideNavigationBack = extraOptions?.disable_navigation_back

  return (
    <>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c">
          { remainingAssessmentTime ? (
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
              safeTimer
            />
          ) : null}
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
          content={campaignOptions?.show_watermark ? campaignOptions?.watermark_content : ''}
          font={{ color: 'rgba(0,0,0,0.3)' }}
          gap={[10, 0]}
          rotate={-15}
        >
          <SubHeader
            title={assessment.name}
            hideBackIcon={hideNavigationBack}
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
                  status={status}
                />
              </ResourcesTabs>
            </div>
          </ConfigProvider>
          <Confirm open={showConfirm} onReset={reset} onOk={() => setShowConfirm(false)} />
          <AreadyCompletedModal
            open={showAlreadyCompletedModal}
            onRetake={reset}
            onCancel={() => setShowAlreadyCompletedModal(false)}
          />
        </Watermark>
      </Content>
    </>
  )
}

export const Common = connector(CommonComponent)
