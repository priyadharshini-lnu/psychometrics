/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Row, Col, PageHeader, Input,
} from 'antd'
import Campaigns from './Campaigns'
import './styles.scss'

const { Content } = Layout
const { Search } = Input
const COLORS = ['#D8D8D8', '#00B1A8', '#246479', '#9DD8D7']

export default function CampaignList ({
  campaigns, fetchCampaigns, downloadReport,
}) {
  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <Layout>
      <Content className="fluid-container">
        <div className="main-container campaigns-list">
          <PageHeader
            className="page-header"
            backIcon={null}
            title={(
              <div className="title-with-dash">
                Assessments
              </div>
            )}
          >
            <Row type="flex" justify="space-between" align="middle" className="controls">
              <Col>
                <Search
                  placeholder="Search"
                  style={{ width: 220 }}
                />
              </Col>
            </Row>
            <Row type="flex" justify="start" className="cards">
              {campaigns.map((campaign, i) => {
                const Component = Campaigns[campaign.type]
                return <Component key={campaign.id} color={COLORS[i % COLORS.length]} campaign={campaign} downloadReport={downloadReport} />
              })}
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
