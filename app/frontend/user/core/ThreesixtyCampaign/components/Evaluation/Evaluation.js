import React, { useEffect } from 'react'
import { Layout, Typography } from 'antd'
import userPresenter from 'presenters/userPresenter'
import data from './data.json'

const { Content } = Layout

export default function Evaluation({ subject, results, fetchEvaluation, match}) {
  useEffect(() => {
    if (results) {
      window.renderPassAssessment('pass_ass')
    }
  }, [results])

  useEffect(() => {
    fetchEvaluation(match.params.campaignId, match.params.id)
  }, [])

  return (
    <Layout>
      <Content>
        <div className="main-container">
          Evaluate {userPresenter.getFullName(subject.user)}
          <div
            id="pass_ass"
            data-type="pass_assessment"
            data-data={JSON.stringify(data)}
            data-result={JSON.stringify(results)}
          />
        </div>
      </Content>
    </Layout>
  )
}
