import React, { useState, useEffect } from 'react'
import {
  Layout, Row, Col, ConfigProvider, PageHeader, Progress, Space,
} from 'antd'
import { ProgressProps } from 'antd/lib/progress'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import './styles.scss'
import Cookies from 'js-cookie'
import Language from 'modules/user/modules/campaigns/components/Language'
import store from 'modules/user/store'
import { Timer } from 'modules/user/modules/campaigns/components/Timer'
import ResourcesTabs from 'modules/user/modules/campaigns/components/ResourcesTabs'
import { useMedia } from 'modules/user/rootHooks'
import Confirm from './Confirm'
import { PropsFromRedux } from './connect'

const { Content } = Layout

interface Params {
  assessmentKey: string
}

type Props = PropsFromRedux

const Common: React.FC<Props> = ({
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
  preview: { enableProgress, initialized },
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
    location.reload(true)
  }

  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            title={assessment.name}
            extra={(
              <Space size="large">
                <Timer
                  key="2"
                  notification
                  theme="plain"
                  seconds={remainingAssessmentTime}
                  onFinish={() => markAssessmentTimedOut(preview)}
                />
                {enableProgress && <Progress key="1" percent={progress} {...progressBarProps} />}
              </Space>
            )}
          />
        </Content>
      </div>
      <Content className="fluid-container">
        <div className="evaluation-container">
          <Row justify="end" className="mtm mrm">
            {availableTranslations && availableTranslations.length > 0 && (
              <Col flex="none">
                <div className="mlm">
                  <Language
                    selectedLanguage={selectedLanguage}
                    availableTranslations={availableTranslations || []}
                  />
                </div>
              </Col>
            )}
          </Row>
          <ConfigProvider direction={selectedLanguage && selectedLanguage.direction}>
            <ResourcesTabs assessment={assessment}>
              <div className={selectedLanguage ? selectedLanguage.direction : ''}>
                <PassAssessment
                  id="pass_assessment"
                  type="pass_assessment"
                  isThreesixty="true"
                  initialized={initialized}
                  resultsUrl={`/user_assessments/${userAssessmentId}/users_results/${id}`}
                  data={assessment}
                  result={results}
                  dashboardUrl={`/campaigns/${campaignId}`}
                  locales={translations}
                  selectedLocale={selectedLanguage && selectedLanguage.code}
                  rstore={store}
                  isAnonymousAssessment="true"
                />
              </div>
            </ResourcesTabs>
          </ConfigProvider>
        </div>
        <Confirm visible={showConfirm} onReset={reset} onOk={() => setShowConfirm(false)} />
      </Content>
    </Layout>
  )
}

export default Common
