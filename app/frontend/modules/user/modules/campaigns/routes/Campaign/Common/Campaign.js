/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React from 'react'
import {
  Layout, Row, Col, PageHeader, Alert,
} from 'antd'
import { STATUSES } from 'constants/campaign'
import './styles.scss'
import Assessments from './Assessments'

const { Content } = Layout

export default function Campaign ({
  history, campaign,
}) {
  const camapaignClosed = campaign.status === STATUSES.CLOSED

  return (
    <Layout>
      <Content className="fluid-container">
        <Row justify="center">
          <Col xs={24} lg={22} xl={18} xxl={16}>
            <div className="main-container">
              <>
                <PageHeader
                  className="page-header"
                  onBack={() => history.push('/dashboard')}
                  title={<div className="title-with-dash">{campaign.name}</div>}
                />
                {camapaignClosed && (
                  <div className="mbm font-bold">
                    <Alert message={I18n.t('campaign.closed_campaign_message')} type="info" showIcon />
                  </div>
                )}
                <Row type="flex" gutter={12} className="cards">
                  {campaign.userAssessments.map((userAssessment) => {
                    const Assessment = Assessments[userAssessment.type]

                    return <Assessment key={userAssessment.id} history={history} userAssessment={userAssessment} />
                  })}
                </Row>
              </>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
