import React, { useEffect } from 'react'
import {
  Layout, Row, Col, Button, Menu, Dropdown, Icon, PageHeader,
} from 'antd'
import qs from 'query-string'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import './styles.scss'

const { Content } = Layout

export default function Evaluation ({
  evaluation: {
    loaded, error, assessment, results,
    results: {
      as_manager: asManager,
      participant: {
        approval_status: approvalStatus,
        evaluator_nomination_status: evaluatorNominationStatus,
      },
    },
  }, fetchAssessment, updateStatus, denyEvaluation,
  match: { params },
  history,
}) {
  const { subject, id } = results
  useEffect(() => {
    if (loaded && !error) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  useEffect(() => {
    const { edit } = qs.parse(location.search)
    fetchAssessment(params.campaignId, params.id, edit)
  }, [])

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  const handleDenyClick = () => {
    denyEvaluation(params.campaignId, params.id)
  }

  const StatusMenu = () => (
    <Menu onClick={(e) => {
      handleStatusClick(e.key)
    }}
    >
      <Menu.Item key="approved">
        Approved
      </Menu.Item>
      <Menu.Item key="waiting">
        Waiting
      </Menu.Item>
      <Menu.Item key="denied">
        Denied
      </Menu.Item>
    </Menu>
  )

  const StatusDropdown = () => {
    if (asManager) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={StatusMenu}
        >
          <div>
            {statusPresenter.getApprovalStatus(approvalStatus)}
            <Icon type="down" />
          </div>
        </Dropdown>
      )
    }

    return evaluatorNominationStatus === 'denied'
      ? <div>{statusPresenter.getApprovalStatus(evaluatorNominationStatus)}</div>
      : (
        <div>
          <Button className="deny-button" onClick={() => handleDenyClick()} type="danger">Deny</Button>
        </div>
      )
  }

  return (
    <Layout>
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={(
            <div>
              <Icon type="arrow-left" />
              {' '}
              Back to tasks
            </div>
          )}
          title={(
            <div>
              Evaluate
              {' '}
              {userPresenter.getFullNameWithEmail(subject)}
            </div>
          )}
          onBack={() => history.push(`/campaigns/${params.campaignId}`)}
        >
          <div className="evaluation-container">
            <Row type="flex" justify="end">
              <Col>
                <StatusDropdown />
              </Col>
            </Row>
            {!error && (
              <div
                id="pass_assessment"
                data-type={asManager ? 'view_results' : 'pass_assessment'}
                data-is-threesixty="true"
                data-results-url={`/campaigns/${params.campaignId}/users_results/${id}`}
                data-data={JSON.stringify(assessment)}
                data-result={JSON.stringify(results)}
                data-dashboard-url={`/campaigns/${params.campaignId}`}
              />
            )}
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
