import React, { useEffect } from 'react'
import {
  Layout, Typography, Button, Row,
} from 'antd'
import './styles.scss'
import userPresenter from 'presenters/userPresenter'

const { Title } = Typography
const { Content } = Layout

export default function Report ({
  report: {
    loaded, report, results, user,
  }, match, fetchReport,
}) {
  useEffect(() => {
    fetchReport(match.params.campaignId, match.params.id)
  }, [])

  useEffect(() => {
    if (loaded) {
      window.initReport('threesixty-report')
    }
  }, [loaded])

  return (
    <Layout>
      <Content>
        <div className="main-container">
          <Row type="flex" justify="space-between">
            <Title level={4}>
              Report for
              {' '}
              {userPresenter.getFullName(user)}
            </Title>
            <div>
              <Button type="primary">Deny</Button>
              <Button type="danger">Approve</Button>
            </div>
          </Row>
          <Row>
            <Button>Download</Button>
          </Row>
          <div
            id="threesixty-report"
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
