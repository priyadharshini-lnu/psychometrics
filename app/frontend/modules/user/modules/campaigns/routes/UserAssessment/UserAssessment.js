import React, { useEffect } from 'react'
import {
  Layout, PageHeader, Row, Col, Progress,
} from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import qs from 'qs'
import cs from 'classnames'
import './styles.scss'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import { minutesLeft } from 'utils/time'
import { isRtl } from 'utils/locales'
import Language from '../../components/Language'
import store from '../../../../store'
import Timer from '../../components/Timer'
import ResourcesTabs from '../../components/ResourcesTabs'

const { Content } = Layout

export default function UserAssessment ({
  userAssessment: {
    loaded, error, assessment, results,
    results: {
      user_assessment_id: userAssessmentId,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      campaign_id: campaignId,
      campaign_options: campaignOptions,
      campaign_user: campaignUser,
      translations,
    },
  }, fetchAssessment,
  match: { params },
  isFrame,
  preview: {
    enableProgress,
    type,
  },
  preview,
  markAssessmentTimedOut,
  progress,
  push,
}) {
  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.userAssessmentId, edit)
  }, [])
  let campaignTimeLeft = null

  if (loaded && campaignOptions.fixed_time) {
    campaignTimeLeft = minutesLeft(new Date(campaignUser.started_at), campaignOptions.fixed_time_duration)
  }

  const rtl = isRtl((selectedLanguage && selectedLanguage.code) || I18n.currentLocale())
  // TODO: Fix by creating a setting for list of rtl languages
  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            backIcon={!isFrame && (
              <div>
                {rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                {' '}
              Back
              </div>
            )}
            title={(
              <div>
                {assessment.name}
              </div>
          )}
            extra={[
              type !== 'preview_block' && enableProgress
              && (<Progress key="1" percent={progress} style={{ width: '200px' }} />),
              <Timer
                key="2"
                preview={preview}
                campaignTimeLeft={campaignTimeLeft}
                onFinish={markAssessmentTimedOut}
              />,
            ]}
            onBack={() => push(`/campaigns/${campaignId}`)}
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
                data={assessment}
                result={results}
                locales={translations}
                dashboardUrl={`/campaigns/${campaignId}`}
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
