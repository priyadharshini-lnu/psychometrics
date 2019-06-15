/* eslint-disable max-len */
import React from 'react'
import {
  Layout, Row, Col, PageHeader, Icon, Card, Progress,
  Input, Dropdown, Menu,
} from 'antd'
import _ from 'lodash'
import './styles.scss'

const { Content } = Layout
const { Search } = Input

export default function CampaignList () {
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
            <Row type="flex" justify="space-between" className="cards">
              {_.times(5, i => (
                <Col className="card" key={i}>
                  <Card
                    bodyStyle={{ padding: 0 }}
                    hoverable
                    cover={(
                      <div className="cover">
                        <img
                          alt="example"
                          src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                        />
                        <div className="card-progress"><Progress percent={30} /></div>
                      </div>
                    )}
                  >
                    <div className="card-body">
                      <div className="card-content">
                        <div className="card-title">
                        Thriving Index Assessment
                        </div>
                        <Row type="flex" className="info-line">
                          <Col className="info-block">
                            <Icon type="clock-circle" />
                            {' '}
                          30 min
                          </Col>
                          <Col className="info-block">
                            <Icon type="question-circle" />
                            {' '}
                          20
                          </Col>
                        </Row>
                        <div className="divider" />
                        <div className="button">
                          <Icon type="play-circle" />
                          {' '}
                        Begin
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
