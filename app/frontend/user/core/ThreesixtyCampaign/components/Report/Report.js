import React, { useEffect } from 'react'
import {
  Layout, Typography, Button, Row, Col,
} from 'antd'
import './styles.scss'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'

const { Title } = Typography
const { Content } = Layout

export default function Report ({
  report: {
    loaded, report, results, user, campaign, approvalStatus, pdf, status,
  }, match: { params }, fetchReport, updateStatus,
}) {
  useEffect(() => {
    fetchReport(params.campaignId, params.id)
  }, [])

  useEffect(() => {
    if (loaded) {
      window.initReport('threesixty-report')
    }
  }, [loaded])

  const handleStatusClick = (status) => {
    updateStatus(params.campaignId, params.id, status)
  }

  return (
    <Layout>
      <Content>
        <div className="main-container">
          <Row type="flex" justify="space-between">
            <Title level={4}>
              Report for
              {' '}
              {userPresenter.getFullNameWithEmail(user)}
            </Title>
            <Col>
              {approvalStatus !== 'waiting'
                ? <div>{statusPresenter.getApprovalStatus(approvalStatus)}</div>
                : (
                  <div>
                    <Button onClick={() => handleStatusClick('approved')} type="primary">Approve</Button>
                    <Button onClick={() => handleStatusClick('denied')} type="danger">Deny</Button>
                  </div>
                )}
            </Col>
          </Row>
          <Row>
            {status === 'prepared'
              ? (
                <Button>
                  <a href={pdf.url} download target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </Button>
              )
              : <div>{statusPresenter.getReportStatus(status)}</div>}
          </Row>
          <div
            id="threesixty-report"
            data-campaign={JSON.stringify(campaign)}
            data-data={JSON.stringify(report)}
            data-results={JSON.stringify(results)}
            data-user={JSON.stringify(user)}
          />
        </div>
      </Content>
    </Layout>
  )
}
export { default as Sidebar } from './Sidebar'
