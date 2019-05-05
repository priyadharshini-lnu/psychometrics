import React, { useEffect } from 'react'
import {
  Layout, Typography, Button, Row, Col,
} from 'antd'
import data from './data.json'
import './Reports.scss'

const { Paragraph, Title } = Typography
const { Content } = Layout

export default function Evaluator () {
  useEffect(() => {
    window.initReport('threesixty-report')
  }, [])

  return (
    <Layout>
      <Content>
        <div className="main-container">
          <Row type="flex" justify="space-between">
            <Title level={4}>
              Report for
              {' '}
              {'Subject Name'}
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
            data-data={JSON.stringify(data)}
          />
        </div>
      </Content>
    </Layout>
  )
}
export { default as Sidebar } from './Sidebar'
