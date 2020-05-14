import React, { useEffect } from 'react'
import {
  Layout, PageHeader, Row, Col, Progress,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import qs from 'qs'
import cs from 'classnames'
import './styles.scss'
import PassAssessment from 'libs/survey/containers/AssessmentContainer'
import Language from '../common/Language'
import store from '../../../../store'
import Timer from '../Timer'

const { Content } = Layout

export default function Assign ({
  assign: {
    loaded, error, assessment, results,
    results: {
      id: assignId,
      selected_locale: selectedLanguage,
      available_translations: availableTranslations,
      translations,
    },
  }, fetchAssessment,
  match: { params },
  history,
  isFrame,
  preview: {
    enableProgress,
    type,
  },
  preview,
  saveResults,
  block,
  progress,
}) {
  useEffect(() => {
    const { edit } = qs.parse(location.search)
    fetchAssessment(params.assignId, edit)
  }, [])
  // TODO: Fix by creating a setting for list of rtl languages
  return (
    <Layout>
      <div className="page-header-wrap">
        <Content className="fluid-container">
          <PageHeader
            className="page-header"
            backIcon={!isFrame && (
              <div>
                <ArrowLeftOutlined />
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
              <Timer key="2" preview={preview} saveResults={saveResults} />,
            ]}
            onBack={() => history.push('/campaigns')}
          />
        </Content>
      </div>
      <Content className={cs('fluid-container', _.get(block, ['props', 'staticContent']) && 'has-static-content')}>
        {availableTranslations && availableTranslations.length > 0 && (
          <Row type="flex" justify="end" className="mtm mrm">
            <Col>
              <Language
                assignId={assignId}
                selectedLanguage={selectedLanguage}
                availableTranslations={availableTranslations || []}
              />
            </Col>
          </Row>
        )}
        <div className={cs('evaluation-container', selectedLanguage && selectedLanguage.direction)}>
          {loaded && !error && (
            <PassAssessment
              id="pass_assessment"
              type="pass_assessment"
              data={assessment}
              result={results}
              locales={translations}
              dashboardUrl="/assessment_completed"
              resultsUrl={`/assigns/${results.id}`}
              selectedLocale={selectedLanguage && selectedLanguage.code}
              rstore={store}
            />
          )}
        </div>
      </Content>
    </Layout>
  )
}
