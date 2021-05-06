import React, { useEffect } from 'react'
import {
  Layout, PageHeader, Row, Col, Progress, Space,
} from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import qs from 'qs'
import cs from 'classnames'
import './styles.scss'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import { isRtl } from 'utils/locales'
import { useMedia } from 'modules/user/rootHooks'
import Language from '../../components/Language'
import store from '../../../../store'
import Timer from '../../components/Timer'
import ResourcesTabs from '../../components/ResourcesTabs'

const { Content } = Layout
const { I18n } = window

export default function UserAssessment ({
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
    },
  }, fetchAssessment,
  match: { params },
  isFrame,
  preview: {
    initialized,
    enableProgress,
    type,
  },
  preview,
  markAssessmentTimedOut,
  progress,
}) {
  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.userAssessmentId, edit)
  }, [])
  const isMaxSm = useMedia('max-sm')
  let progressBarProps = { type: 'line', style: { width: '200px' } }
  if (isMaxSm) { progressBarProps = { type: 'circle', width: 50 } }

  if (!loaded) { return null }


  const rtl = isRtl(I18n.uiLocale)
  // TODO: Fix by creating a setting for list of rtl languages
  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            backIcon={!isFrame && (
              <Space>
                {rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                {` ${I18n.t('assessments.page.back')}`}
              </Space>
            )}
            title={(
              <div>
                {assessment.name}
              </div>
          )}
            extra={(
              <Space size="large">
                {remainingCampaignTime && (
                <div className="text-align-c">
                  <Timer
                    key="1"
                    theme="plain"
                    seconds={remainingCampaignTime}
                    onFinish={() => markAssessmentTimedOut(preview)}
                  />
                  <div>Campaign</div>
                </div>
                )}
                {remainingAssessmentTime && (
                <div className="text-align-c">
                  <Timer
                    key="2"
                    theme="plain"
                    notification
                    seconds={remainingAssessmentTime}
                    onFinish={() => markAssessmentTimedOut(preview)}
                  />
                  <div>Assessment</div>
                </div>
                )}
                {type !== 'preview_block' && enableProgress && (
                  <Progress key="3" percent={progress} {...progressBarProps} />
                )}
              </Space>
            )}
            onBack={() => { window.location.href = `/campaigns/${campaignId}` }}
          />
        </Content>
      </div>
      <Content className="fluid-container">
        {availableTranslations && availableTranslations.length > 0 && (
          <Row type="flex" justify="end" className="mtm mrm lang-row">
            <Col>
              <Language
                assignId={userAssessmentId}
                selectedLanguage={selectedLanguage}
                availableTranslations={availableTranslations || []}
              />
            </Col>
          </Row>
        )}
        <div className={cs('evaluation-container', selectedLanguage && selectedLanguage.direction)}>
          {loaded && !error && (
            <ResourcesTabs assessment={assessment}>
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
      </Content>
    </Layout>
  )
}
