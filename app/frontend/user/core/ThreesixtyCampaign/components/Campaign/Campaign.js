/* eslint-disable max-len */
import React, { useEffect } from 'react'
import { Layout, Typography } from 'antd'

import Nominations from './NominationList'
import Evaluations from './EvaluationList'
import Reports from './ReportList'
import './styles.scss'

const { Paragraph, Title } = Typography
const { Content } = Layout

export default function Campaign (props) {
  useEffect(() => {
    props.fetchCampaign(props.match.params.campaignId)
  }, [])

  return (
    <Layout>
      <Content>
        <div className="main-container">
          <Title level={4}>All Tasks</Title>
          <Paragraph>
            Welcome to the 360 Degree Assessment at Signify. This assessment has been provided to help support your development at Signigfy.
          </Paragraph>
          <Paragraph>
            Please nominate all your evaluators from whom you wish to receive feedback, and then complete your self-assessment. You are encouraged to nominate feedback from a wide network of colleagues, remembering you must receive feedback from at least three evaluators in each group(apart from the line manager) to receive your report. We encourage you to discuss and agree your evaluators with your line manager before entering them on the system.
          </Paragraph>
          <Paragraph>
            If you have any questions regarding the 360 Degree process, please visit URL or contact(email id here).
          </Paragraph>
          <Paragraph>
            Incase you experience any technical difficulties, please contact MAIL.
          </Paragraph>
          <Paragraph>
            Thank you for your participation!
          </Paragraph>
          <div style={{ marginTop: '24px' }}><Nominations {...props} /></div>
          <div style={{ marginTop: '24px' }}><Evaluations {...props} /></div>
          <div style={{ marginTop: '24px' }}><Reports {...props} /></div>
        </div>
      </Content>
    </Layout>
  )
}
