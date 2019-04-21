import React from 'react'
import { Layout, Typography } from 'antd'

const { Paragraph, Title } = Typography
const { Content } = Layout

export default function Evaluator () {
  return (
    <Layout>
      <Content>
        <div className="main-container">
          Evaluation page
        </div>
      </Content>
    </Layout>
  )
}
export { default as Sidebar } from './Sidebar'
