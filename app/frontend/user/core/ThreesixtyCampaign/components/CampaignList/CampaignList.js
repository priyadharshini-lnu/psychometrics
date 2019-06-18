/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Row, Col, PageHeader, Icon, Card, Progress,
  Input, Dropdown, Menu,
} from 'antd'
import _ from 'lodash'
import Campaigns from './Campaigns'
import './styles.scss'

const { Content } = Layout
const { Search } = Input

export default function CampaignList ({ campaigns, fetchCampaigns }) {
  useEffect(() => {
    fetchCampaigns()
  }, [])
  const menu = (
    <Menu>
      <Menu.Item key="0">
        Date created
      </Menu.Item>
      <Menu.Item key="1">
        Name
      </Menu.Item>
    </Menu>
  )

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
              <Col>
                <Dropdown overlay={menu} trigger={['click']}>
                  <a className="ant-dropdown-link" href="#">
                    Sort by
                    {' '}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </Col>
            </Row>
            <Row type="flex" justify="start" className="cards">
              {campaigns.map((campaign) => {
                const Component = Campaigns[campaign.type]
                console.log(campaign.type)
                return <Component key={campaign.id} campaign={campaign} />
              })}
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
