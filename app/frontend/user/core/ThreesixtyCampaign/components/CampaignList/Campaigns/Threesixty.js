/* eslint-disable max-len */
import React from 'react'
import {
  Row, Col, Icon, Card, Progress,
  Dropdown, Menu,
} from 'antd'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import './styles.scss'

export default function Threesixty ({ campaign }) {
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
              <Link to={`/campaigns/${campaign.id}`}>
                <Icon type="play-circle" />
                {' '}
                Begin
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  )
}
