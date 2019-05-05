import React from 'react'
import { Layout, Button, Progress } from 'antd'

const { Sider } = Layout

export default function Sidebar ({ history, match }) {
  const goToReports = () => {
    history.push(`/campaigns/${match.params.campaignId}/reports`)
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

        <Progress
          className="threesixty-progress"
          type="circle"
          percent={30}
          format={percent => (
            <div>
              <div className="percentage">{`${percent}%`}</div>
              <div className="complete-label">Complete</div>
            </div>
          )}
        />

        <div className="line-progress">
          <div className="label">
            <div className="caption">Nominations</div>
            <div className="value">1 of 3</div>
          </div>
          <Progress percent={33} showInfo={false} />
        </div>

        <div className="line-progress">
          <div className="label">
            <div className="caption">Evaluators</div>
            <div className="value">1 of 3</div>
          </div>
          <Progress percent={33} showInfo={false} />
        </div>

        <div className="line-progress">
          <div className="label">
            <div className="caption">Reports</div>
            <div className="value">1 of 2</div>
          </div>
          <Progress percent={50} showInfo={false} />
        </div>
        <div className="reports-btn">
          <Button block type="primary" onClick={goToReports}>View Reports</Button>
        </div>
      </div>
    </Sider>
  )
}
