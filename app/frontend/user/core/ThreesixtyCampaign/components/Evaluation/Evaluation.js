import React, { useEffect } from 'react'
import {
  Layout, Row, Col, Button,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'

const { Content } = Layout

export default function Evaluation ({
  evaluation: {
    loaded, assessment, results, results: { participant },
  }, fetchAssessment, updateStatus,
  match: { params },
}) {
  const { subject, id } = results
  useEffect(() => {
    if (loaded) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  useEffect(() => {
    fetchAssessment(params.campaignId, params.id)
  }, [])

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  return (
    <Layout>
      <Content>
        <div className="main-container">
          <Row type="flex" justify="space-between">
            <Col>
              Evaluate
              {' '}
              {userPresenter.getFullName(subject)}
            </Col>
            <Col>
              {participant.evaluatorNominationStatus !== 'waiting'
                ? <div>{statusPresenter.getApprovalStatus(participant.evaluatorNominationStatus)}</div>
                : (
                  <div>
                    <Button onClick={() => handleStatusClick('approved')} type="primary">Approve</Button>
                    <Button onClick={() => handleStatusClick('denied')} type="danger">Deny</Button>
                  </div>
                )}

            </Col>
          </Row>
          <div
            id="pass_assessment"
            data-type="pass_assessment"
            data-is-threesixty="true"
            data-results-url={`/campaigns/${params.campaignId}/users_results/${id}`}
            data-data={JSON.stringify(assessment)}
            data-result={JSON.stringify(results)}
            data-dashboard-url={`/campaigns/${params.campaignId}`}
          />
        </div>
      </Content>
    </Layout>
  )
}
