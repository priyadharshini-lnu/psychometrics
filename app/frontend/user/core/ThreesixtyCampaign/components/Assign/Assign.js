import React, { useEffect } from 'react'
import {
  Layout, Icon, PageHeader,
} from 'antd'
import qs from 'query-string'
import './styles.scss'

const { Content } = Layout

export default function SingleAssign ({
  assign: {
    loaded, error, assessment, results,
  }, fetchAssessment,
  match: { params },
  history,
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


  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={(
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
          <div className="evaluation-container">
            {!error && (
              <div
                id="pass_assessment"
                data-type="pass_assessment"
                data-data={JSON.stringify(assessment)}
                data-result={JSON.stringify(results)}
                data-dashboard-url="/assessment_completed"
              />
            )}
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
