import React from 'react'
import {
  Layout, Button, Progress,
} from 'antd'
import { LeftOutlined } from '@ant-design/icons'

const { Sider } = Layout

export default function Sidebar ({ history, match }) {
  const goBack = () => {
    history.push(`/threesixty_campaigns/${match.params.campaignId}`)
  }

  return (
    <Sider
      width={240}
      className="campaign-sidebar"
      style={{
        background: 'rgb(255, 255, 255)',
      }}
    >
      <div className="content">
        <div className="reports-btn">
          <Button type="primary" block onClick={goBack}>
            <LeftOutlined />
            All Tasks
          </Button>
        </div>
        <div className="line-progress">
          <div className="label">
            <div className="caption">Nominations</div>
            <div className="value">1 of 3</div>
          </div>
          <Progress percent={33} showInfo={false} />
        </div>
      </div>
    </Sider>
  )
}
