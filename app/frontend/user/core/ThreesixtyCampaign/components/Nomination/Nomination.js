/* eslint-disable max-len */
import React, { useEffect } from 'react'
import { Layout, Typography } from 'antd'
import NominationForm from './NominationForm/NominationForm'
import NominationTable from './NominationTable/NominationTable'

const { Paragraph, Title } = Typography
const { Content } = Layout

export default function Nominations (props) {
  useEffect(() => {
    props.fetchNomination(props.match.params)
  }, [])
  return (
    <Layout>
      <Content>
        <div className="main-container">
          <Title level={4}>All Tasks</Title>
          <Paragraph>
            Please nominate your evaluators for feedback. In order to obtain comprehensive and useful feedback, you are encouraged to nominate a board range of Peers, Direct and Indirect Reports, and other Internal Stakeholders.
          </Paragraph>
          <Paragraph>
            Please ensure you select a minimum of three evaluators from each of these groups. Your nominations will be approve by your Line Manager, before the requests for feedback are sent directly to the Evaluators. We encourage you to discuss and agree your evaluators with your line manager before entering them on the system.
          </Paragraph>
          <Paragraph>
            If you have any questions regarding the 360 Degree process, please visit or contact (email id here).
          </Paragraph>
          <Paragraph>
            Incase you experience any technical difficulties, please contact signify360@thetalententerprise.com
          </Paragraph>
          <NominationForm {...props} />
          <NominationTable {...props} />
        </div>
      </Content>
    </Layout>
  )
}
