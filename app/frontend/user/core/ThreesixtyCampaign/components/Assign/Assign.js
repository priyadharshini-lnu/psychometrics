import React, { useEffect } from 'react'
import {
  Layout, Icon, PageHeader, Row, Col,
} from 'antd'
import qs from 'query-string'
import cs from 'classnames'
import './styles.scss'
import PassAssessment from 'libs/survey/containers/AssessmentContainer'
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
            {loaded && !error && (
              <PassAssessment
                id="pass_assessment"
                type="pass_assessment"
                data={assessment}
                result={results}
                locales={translations}
                dashboardUrl="/assessment_completed"
                selectedLocale={selectedLanguage && selectedLanguage.code}
              />
            )}
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
