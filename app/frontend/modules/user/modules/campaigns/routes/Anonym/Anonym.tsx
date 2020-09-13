import React, { useState, useEffect } from 'react'
import {
  Layout, Row, Col, ConfigProvider, PageHeader,
} from 'antd'
import qs from 'qs'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import './styles.scss'
import cs from 'classnames'
import Cookies from 'js-cookie'
import Assessment from 'modules/admin/modules/campaigns/interfaces/Assessment'
import _ from 'lodash'
import Language from '../../components/Language'
import store from '../../../../store'
import Timer from '../../components/Timer'
import ResourcesTabs from '../../components/ResourcesTabs'
import Confirm from './Confirm'
import { PropsFromRedux } from './connect'

const { Content } = Layout

interface OwnProps {
  anonym: {
    loaded: boolean
    error: boolean
    assessment: Assessment
    results: {
      id: number
      campaign_id: number
      user_assessment_id: number
      selected_locale: { direction?: 'rtl' | 'ltr', code: string }
      available_translations: string[]
      translations: object
      current_step: number
      current_element: number
    }
  }
  match: { params: {assessmentKey: string}}
  preview: {
    enableProgress: boolean
    expiryDate: Date
    timerDuration: number
  }
  progress: number
  block: object
  fetchAssessment: (assessmentId: string, { step: number, lang: string }) => void
  saveResults: (assessmentId: string, { step: number, lang: string }) => void
}

type Props = PropsFromRedux & OwnProps

const Anonym: React.FC<Props> = ({
  anonym: {
    loaded, error, assessment, results,
    results: {
      id,
      campaign_id: campaignId,
      user_assessment_id: userAssessmentId,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      translations,
      current_step: currentStep,
      current_element: currentElement,
    },
  },
  fetchAssessment,
  match: { params },
  preview,
  markAssessmentTimedOut,
  block,
}) => {
  const assessmentRef = React.createRef()
  const {
    edit, step, lang,
  } = qs.parse(location.search.substr(1))

  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetchAssessment(params.assessmentKey, { step, lang })
  }, [])

  useEffect(() => {
    if (currentElement > 0 || currentStep > 0) {
      setShowConfirm(true)
    }
  }, [results])

  if (!loaded || error) { return null }

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
            extra={[
              <Timer key="2" preview={preview} onFinish={markAssessmentTimedOut} />,
            ]}
          />
        </Content>
      </div>
      <Content className={
          cs('fluid-container', { 'has-static-content': _.get(block, ['props', 'staticContent']) })
        }
      >
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
          {!error && (
            <ConfigProvider direction={selectedLanguage && selectedLanguage.direction}>
              <ResourcesTabs assessment={assessment}>
                <div className={selectedLanguage ? selectedLanguage.direction : ''}>
                  <PassAssessment
                    ref={assessmentRef}
                    id="pass_assessment"
                    type="pass_assessment"
                    isThreesixty="true"
                    resultsUrl={`/user_assessments/${userAssessmentId}/users_results/${id}`}
                    data={assessment}
                    result={results}
                    dashboardUrl={`/campaigns/${campaignId}`}
                    locales={translations}
                    selectedLocale={selectedLanguage && selectedLanguage.code}
                    notAnEndPage={edit === 'true'}
                    rstore={store}
                    isAnonymousAssessment="true"
                  />
                </div>
              </ResourcesTabs>
            </ConfigProvider>
          )}
        </div>
        <Confirm visible={showConfirm} onReset={reset} onOk={() => setShowConfirm(false)} />
      </Content>
    </Layout>
  )
}

export default Anonym
