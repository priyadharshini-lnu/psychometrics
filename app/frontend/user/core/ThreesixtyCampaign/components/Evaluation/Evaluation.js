import React, { useEffect } from 'react'
import { Layout } from 'antd'
import userPresenter from 'presenters/userPresenter'

const { Content } = Layout

export default function Evaluation ({
  evaluation, assessment, results, fetchAssessment, match,
}) {
  const { subject, loaded, id } = evaluation
  useEffect(() => {
    if (loaded) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  useEffect(() => {
    fetchAssessment(match.params.campaignId, match.params.id)
  }, [])
  return (
    <Layout>
      <Content>
        <div className="main-container">
          Evaluate
          {' '}
          {userPresenter.getFullName(subject)}
          <div
            id="pass_assessment"
            data-type="pass_assessment"
            data-is-threesixty="true"
            data-results-url={`/users_results/${id}`}
            data-data={JSON.stringify(assessment)}
            data-result={JSON.stringify(results)}
          />
        </div>
      </Content>
    </Layout>
  )
}
