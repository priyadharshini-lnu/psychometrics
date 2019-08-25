/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Row, PageHeader,
} from 'antd'
import Campaigns from './Campaigns'
import './styles.scss'

const { Content } = Layout

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
            <Row type="flex" gutter={12} className="cards">
              {campaigns.map((campaign, i) => {
                const Component = Campaigns[campaign.type]
                return <Component key={campaign.id} campaign={campaign} downloadReport={downloadReport} />
              })}
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
