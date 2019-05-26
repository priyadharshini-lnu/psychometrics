import React from 'react'
import { Layout, Button, Progress } from 'antd'

const { Sider } = Layout

export default function Sidebar ({
  history, match, evaluations, nominations, subjectReport, reports,
}) {
  const goToReports = () => {
    history.push(`/campaigns/${match.params.campaignId}/reports/${subjectReport.id}`)
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
          strokeColor="#00B4AA"
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
            <div className="value">
              {'1 of '}
              {nominations}
            </div>
          </div>
          <Progress percent={33} showInfo={false} />
        </div>

        <div className="line-progress">
          <div className="label">
            <div className="caption">Evaluations</div>
            <div className="value">
              {'1 of '}
              {evaluations}
            </div>
          </div>
          <Progress percent={33} showInfo={false} />
        </div>

        <div className="line-progress">
          <div className="label">
            <div className="caption">Reports</div>
            <div className="value">
              {'1 of '}
              {reports.length}
            </div>
          </div>
          <Progress percent={50} showInfo={false} />
        </div>
        {subjectReport && (
          <div className="reports-btn">
            <Button block type="primary" onClick={goToReports}>View Reports</Button>
          </div>
        )}
      </div>
    </Sider>
  )
}
