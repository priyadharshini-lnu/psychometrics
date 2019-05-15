import React, { useEffect } from 'react'
import { Layout } from 'antd'
import userPresenter from 'presenters/userPresenter'

const { Content } = Layout

export default function Evaluation ({
  subject, assessment, results, fetchAssessment, match,
}) {
  useEffect(() => {
    if (results) {
      window.renderPassAssessment('pass_ass')
    }
  }, [results])

  useEffect(() => {
    fetchAssessment(match.params.campaignId, match.params.id)
  }, [])

  return (
    <Layout>
      <Content>
        <div className="main-container">
          Evaluate
          {' '}
          {userPresenter.getFullName(subject.user)}
          <div
            id="pass_ass"
            data-type="pass_assessment"
            data-data={JSON.stringify(assessment)}
            data-result={JSON.stringify(results)}
          />
        </div>
      </Content>
    </Layout>
  )
}
