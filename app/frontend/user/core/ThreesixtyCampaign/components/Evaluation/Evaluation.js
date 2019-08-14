import React, { useEffect } from 'react'
import {
  Layout, Row, Col, Button, Menu, Dropdown, Icon, PageHeader, Tooltip,
} from 'antd'
import qs from 'query-string'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import './styles.scss'
import humps from 'humps'

const { Content } = Layout

export default function Evaluation ({
  evaluation: {
    loaded, error, assessment, results,
    results: {
      as_manager: asManager,
      participant: {
        manager_evaluation_status: managerEvaluationStatus
      },
    },
  }, fetchAssessment, clearEvalaution, updateStatus,
  match: { params },
  history,
}) {
  const { id } = results
  let { subject, user } = results
  subject = humps.camelizeKeys(subject)
  user = humps.camelizeKeys(user)

  useEffect(() => {
    if (loaded && !error) {
      window.renderPassAssessment('pass_assessment')
    }
  }, [loaded])

  const { edit, step, approveEvaluation } = qs.parse(location.search)

  useEffect(() => {
    fetchAssessment(params.campaignId, params.id, { isEdit: edit, step })
  }, [])

  if (!loaded) { return null }

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
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
    if (approveEvaluation) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={StatusMenu}
        >
          <div>
            {statusPresenter.getApprovalStatus(managerEvaluationStatus)}
            <Icon type="down" />
          </div>
        </Dropdown>
      )
    }

    return null
  }

  const title = () => {
    if (asManager) {
      return (
        <div>
          Subject:
          {' '}
          <Tooltip placement="topLeft" title={subject.email}>
            {userPresenter.getFullName(subject)}
          </Tooltip>

          &nbsp; &nbsp;

          Evalautor:
          {' '}
          <Tooltip placement="topLeft" title={user.email}>
            {userPresenter.getFullName(user)}
          </Tooltip>
        </div>
      )
    }

    return (
      <div>
          Evaluate:
        {' '}
        {userPresenter.getFullName(subject)}
      </div>
    )
  }

  const handleBackButtonClick = () => {
    clearEvalaution()
    history.push(`/campaigns/${params.campaignId}`)
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
          title={title()}
          onBack={handleBackButtonClick}
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
