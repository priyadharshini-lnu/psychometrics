/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Typography, Row, Col, PageHeader, Progress,
} from 'antd'

import Nominations from './NominationList'
import Evaluations from './EvaluationList'
import Reports from './ReportList'
import './styles.scss'

const { Paragraph } = Typography
const { Content } = Layout

export default function Campaign ({
  history, match, fetchCampaign,
}) {
  useEffect(() => {
    fetchCampaign(match.params.campaignId)
  }, [])

  return (
    <Layout>
      <Content>
        <div className="main-container">
          <PageHeader
            className="page-header"
            onBack={() => history.push('/')}
            title={<div className="title-with-dash">Signify 360° Review - Apply Level</div>}
          >
            <div className="content padding">
              <Row type="flex">
                <Paragraph>
                    Welcome to the 360 Degree Assessment at Signify. Your feedback is appreciated!
                </Paragraph>
                <Paragraph>
                    Please respond to the questions open and honestly and remember your individual responses are confidential.
                </Paragraph>
                <Paragraph>
                    If you have any questions regarding the 360 Degree process, please visit www.signify360.com or contact (email id here)
                </Paragraph>
                <Paragraph>
                    Incase you experience any technical difficulties, please contact signify360@thetalententerprise.com
                </Paragraph>
                <Paragraph>
                    Thank you for your participation!
                </Paragraph>
              </Row>
              <Row gutter={16} className="progress-wrapper">
                <Col xs={{ span: 32 }} lg={{ span: 16 }}>
                  <div className="progress-column">
                    <Progress
                      strokeColor="#00B4AA"
                      percent={30}
                      strokeWidth={16}
                      format={percent => (
                        <div className="percentage">{`${percent}%`}</div>
                      )}
                    />
                    <div className="progress-label">Total progress</div>
                  </div>
                </Col>
                <Col xs={{ span: 32 }} lg={{ span: 8 }}>
                  <div className="progresses">
                    <div className="mini-progress">
                      <div className="letter-icon">N</div>
                      <Progress
                        className="progress-line"
                        percent={30}
                        showInfo={false}
                        strokeColor="#00B4AA"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="mini-progress">
                      <div className="letter-icon">E</div>
                      <Progress
                        className="progress-line"
                        percent={30}
                        showInfo={false}
                        strokeColor="#00B4AA"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="mini-progress">
                      <div className="letter-icon">R</div>
                      <Progress
                        className="progress-line"
                        percent={30}
                        showInfo={false}
                        strokeColor="#00B4AA"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <Row gutter={16}>
              <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                <Nominations />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                <Evaluations />
              </Col>
              <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ marginTop: 16 }}>
                <Reports />
              </Col>
            </Row>
          </PageHeader>
        </div>
      </Content>
    </Layout>
  )
}
