import React, { useEffect } from 'react'
import {
  Layout, Icon, PageHeader, Row, Col,
} from 'antd'
import qs from 'query-string'
import cs from 'classnames'
import './styles.scss'
import Language from '../common/Language'

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
}) {
  useEffect(() => {
    if (loaded && !error) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  useEffect(() => {
    const { edit } = qs.parse(location.search)
    fetchAssessment(params.assignId, edit)
  }, [])
  // TODO: Fix by creating a setting for list of rtl languages
  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={!isFrame && (
            <div>
              <Icon type="arrow-left" />
              {' '}
              Back
            </div>
          )}
          title={(
            <div>
              {assessment.name}
            </div>
          )}
          onBack={() => history.push('/campaigns')}
        >
          {availableTranslations && availableTranslations.length > 0 && (
            <Row type="flex" justify="end">
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
            {!error && (
              <div
                id="pass_assessment"
                data-type="pass_assessment"
                data-data={JSON.stringify(assessment)}
                data-result={JSON.stringify(results)}
                data-locales={JSON.stringify(translations)}
                data-dashboard-url="/assessment_completed"
                data-selected-locale={selectedLanguage && selectedLanguage.code}
              />
            )}
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
