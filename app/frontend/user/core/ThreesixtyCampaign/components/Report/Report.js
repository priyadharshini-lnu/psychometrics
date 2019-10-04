import React, { useEffect } from 'react'
import {
  Layout, Typography, Button, Row, Col, PageHeader, Icon, message,
} from 'antd'
import './styles.scss'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import ReportPreview from 'reports-ui/report'

const { Title } = Typography
const { Content } = Layout

export default function Report ({
  report: {
    loaded, report, results, user, campaign, approvalStatus, isSelf,
  }, match: { params }, fetchReport, updateStatus, downloadReport,
  options: { approval: { managerApprovesReports } }, history,
}) {
  useEffect(() => {
    fetchReport(params.campaignId, params.id)
  }, [])

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  const requestDownloadReport = (campaignId, usersReportId) => {
    downloadReport(campaignId, usersReportId)
      .then(({ response }) => {
        if (response.success) {
          message.success('Report is generating. We will let you know when the report is ready.', 3)
        }
      })
  }

  if (!loaded) { return null }

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
          onBack={() => history.push(`/campaigns/${params.campaignId}`)}
        >
          <div className="main-container">
            <Row type="flex" justify="space-between">
              <Title level={4}>
                Report for
                {' '}
                {userPresenter.getFullNameWithEmail(user)}
              </Title>
              <Col>
                <StatusItem
                  isSelf={isSelf}
                  managerApprovesReports={managerApprovesReports}
                  approvalStatus={approvalStatus}
                  handleStatusClick={handleStatusClick}
                />
              </Col>
            </Row>
            <Row>
              {
                <Button onClick={() => requestDownloadReport(params.campaignId, params.id)}>
                  {I18n.t('threesixty.generate_report')}
                </Button>
              }
            </Row>
            <ReportPreview
              id="threesixty-report"
              data={report}
              results={results}
              campaign={JSON.stringify(campaign)}
              user={JSON.stringify(user)}
            />
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}

function StatusItem ({
  isSelf, managerApprovesReports, approvalStatus, handleStatusClick,
}) {
  if (isSelf || !managerApprovesReports) { return null }

  if (approvalStatus !== 'waiting') {
    return <div>{statusPresenter.getApprovalStatus(approvalStatus)}</div>
  }

  return (
    <div>
      <Button onClick={() => handleStatusClick('approved')} type="primary">Approve</Button>
      <Button className="mlm" onClick={() => handleStatusClick('denied')} type="danger">Deny</Button>
    </div>
  )
}

export { default as Sidebar } from './Sidebar'
