/* eslint-disable max-len */
import React, { useEffect } from 'react'
import {
  Layout, Typography, PageHeader, Icon,
} from 'antd'
import NominationForm from './NominationForm/NominationForm'
import NominationTable from './NominationTable/NominationTable'
import './styles.scss'

const { Paragraph } = Typography
const { Content } = Layout

export default function Nominations (props) {
  useEffect(() => {
    props.fetchNomination(props.match.params)
  }, [])

  return (
    <Layout className="layout">
      <Content className="fluid-container">
        <PageHeader
          className="page-header"
          backIcon={(
            <div>
              <Icon type="arrow-left" />
              {' '}
              Back to tasks
            </div>
          )}
          onBack={() => props.history.push(`/campaigns/${props.match.params.campaignId}`)}
        >
          <div className="nominations-container">
            <div className="content padding">
              <Paragraph>
                Please nominate all your elevators from whom you wish to recieve feedback. And then complete your self- assessment.
              </Paragraph>
              <Paragraph>
                Please ensure you select a minimun of three evaluators from each of the groups. Your nominationswill be approved by your Line Manager, before the requests for feedback are send directly to the Evaluators. We encourage you to discuss and agree your evaluators with your Line Manager before entering them on the system.
              </Paragraph>
              <Paragraph>
                If you have any questions, please contact us.
              </Paragraph>
            </div>
            <NominationForm {...props} />
            <NominationTable {...props} />
          </div>
        </PageHeader>
      </Content>
    </Layout>
  )
}
