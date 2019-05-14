import React, { useEffect } from 'react'
import { Layout } from 'antd'
import userPresenter from 'presenters/userPresenter'
import data from './data.json'

const { Content } = Layout

export default function Evaluation ({
  evaluation, fetchEvaluation, match,
}) {
  const { subject, loaded, id } = evaluation
  useEffect(() => {
    if (loaded) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  useEffect(() => {
    fetchEvaluation(match.params.campaignId, match.params.id)
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
            data-data={JSON.stringify(data)}
            data-result={JSON.stringify(evaluation)}
          />
        </div>
      </Content>
    </Layout>
  )
}
