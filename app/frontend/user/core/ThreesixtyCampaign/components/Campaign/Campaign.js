import React, { useEffect } from 'react'
import { Layout, Typography } from 'antd'

import Nominations from './NominationsList'
import Evaluations from './EvaluationsList'
import Reports from './ReportsList'
import './Campaign.scss'

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
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus ipsam nam tempore optio officiis quod, tenetur quis totam amet odit nemo ab enim incidunt aperiam quas quaerat facere, doloremque quidem.
          </Paragraph>
          <Paragraph>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus ipsam nam tempore optio officiis quod, tenetur quis totam amet odit nemo ab enim incidunt aperiam quas quaerat facere, doloremque quidem.
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus ipsam nam tempore optio officiis quod, tenetur quis totam amet odit nemo ab enim incidunt aperiam quas quaerat facere, doloremque quidem.
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus ipsam nam tempore optio officiis quod, tenetur quis totam amet odit nemo ab enim incidunt aperiam quas quaerat facere, doloremque quidem.
          </Paragraph>
          <Paragraph>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus ipsam nam tempore optio officiis quod, tenetur quis totam amet odit
          </Paragraph>
          <Paragraph>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          </Paragraph>
          <div style={{ marginTop: '24px' }}><Nominations {...props} /></div>
          <div style={{ marginTop: '24px' }}><Evaluations {...props} /></div>
          <div style={{ marginTop: '24px' }}><Reports {...props} /></div>
        </div>
      </Content>
    </Layout>
  )
}
