import React from 'react'
import {
  Layout, Button, Progress, Icon,
} from 'antd'

const { Sider } = Layout

export default function Sidebar ({ history, match }) {
  const goBack = () => {
    history.push(`/campaigns/${match.params.campaignId}`)
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
            <Icon type="left" />
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
