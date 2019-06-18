/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Row, Col, PageHeader, Icon, Card, Progress,
  Input, Dropdown, Menu,
} from 'antd'
import _ from 'lodash'
import './styles.scss'

const { Content } = Layout
const { Search } = Input

export default function SingleAssign ({ campaign }) {
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
    <Col className="card">

      <Card
        bodyStyle={{ padding: 0 }}
        hoverable
        cover={(
          <div className="cover">
            <img
              alt="example"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
            <div className="card-progress">
              <Progress
                percent={campaign.completionPercent}
                strokeColor="#00B4AA"
              />
            </div>
          </div>
        )}
      >
        <div className="card-body">
          <div className="card-content">
            <div className="card-title">
              {campaign.assessmentName}
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
              <a href={campaign.url}>
                <Icon type="play-circle" />
                {' '}
                Begin
              </a>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  )
}
