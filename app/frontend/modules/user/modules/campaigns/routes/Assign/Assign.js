import React, { useEffect } from 'react'
import {
  Layout, PageHeader, Row, Col, Progress, ConfigProvider, Affix, Space,
} from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import qs from 'qs'
import cs from 'classnames'
import './styles.scss'
import PassAssessment from 'modules/survey/containers/AssessmentContainer'
import { isRtl } from 'utils/locales'
import Language from '../../components/Language'
import store from '../../../../store'
import { Timer } from '../../components/Timer'
import ResourcesTabs from '../../components/ResourcesTabs'

const { Content } = Layout
const { I18n } = window

export default function Assign ({
  assign: {
    loaded, error, assessment, results,
    results: {
      id: assignId,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      translations,
      remaining_assessment_time: remainingAssessmentTime,
    },
  }, fetchAssessment,
  match: { params },
  isFrame,
  preview: {
    enableProgress,
    type,
    initialized,
  },
  preview,
  markAssessmentTimedOut,
  progress,
}) {
  useEffect(() => {
    const { edit } = qs.parse(location.search.substr(1))
    fetchAssessment(params.assignId, edit)
  }, [])
  const rtl = isRtl(I18n.uiLocale)
  // TODO: Fix by creating a setting for list of rtl languages
  return (
    <Layout>
      <Affix offsetTop={0}>
        <div className="page-header-wrap">
          <Content className="fluid-container">
            <PageHeader
              className="page-header"
              backIcon={!isFrame && (
                <Space>
                  {rtl ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                  {` ${I18n.t('assessments.page.back', { locale: I18n.uiLocale })}`}
                </Space>
              )}
              title={(
                <div>
                  {assessment.name}
                </div>
              )}
              extra={(
                <Space size="middle">
                  {remainingAssessmentTime && (
                  <Timer
                    key="2"
                    theme="plain"
                    notification
                    seconds={remainingAssessmentTime}
                    onFinish={() => markAssessmentTimedOut(preview)}
                  />
                  )}
                  {type !== 'preview_block' && enableProgress
                    && (<Progress key="1" percent={progress} style={{ width: '200px' }} />)}
                </Space>
              )}
              onBack={() => { window.location.href = '/dashboard' }}
            />
          </Content>
        </div>
      </Affix>
      <Content className="fluid-container">
        {availableTranslations && availableTranslations.length > 0 && (
          <Row type="flex" justify="end" className="mtm mrm lang-row">
            <Col>
              <Language
                assignId={assignId}
                selectedLanguage={selectedLanguage}
                availableTranslations={availableTranslations || []}
              />
            </Col>
          </Row>
        )}
        <ConfigProvider direction={selectedLanguage && selectedLanguage.direction}>
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
                  dashboardUrl="/assessment_completed"
                  resultsUrl={`/assigns/${results.id}`}
                  selectedLocale={selectedLanguage && selectedLanguage.code}
                  rstore={store}
                />
              </ResourcesTabs>
            )}
          </div>
        </ConfigProvider>
      </Content>
    </Layout>
  )
}
