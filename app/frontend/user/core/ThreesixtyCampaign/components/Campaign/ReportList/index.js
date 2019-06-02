import React from 'react'
import { List, Collapse, Icon } from 'antd'
import { Link } from 'react-router-dom'
import userPresenter from 'presenters/userPresenter'
import connect from './connect'
import './styles.scss'

const { Panel } = Collapse

const ReportItem = item => (
  <List.Item>
    <Link to={`/campaigns/${item.campaignId}/reports/${item.id}`}>
      {!item.approval_status
        ? <Icon type="check-square" theme="filled" className="status-icon" />
        : <div className="empty-square" />}
      {' '}
      {userPresenter.getFullNameWithEmail(item.user)}
    </Link>
  </List.Item>
)

const CollapseItem = ({ title, list }) => (
  <Collapse bordered={false} accordion={false} defaultActiveKey="panel">
    <Panel header={title} forceRender key="panel">
      <List
        size="large"
        dataSource={list}
        renderItem={ReportItem}
      />
    </Panel>
  </Collapse>
)

function ReportList ({ approvalReports, subjectReport }) {
  return (
    <List
      className="column-list report-list"
      size="large"
      header={<div>Reports</div>}
      bordered
    >
      {subjectReport && (
        <div className="report-row">
          <Link to={`/campaigns/${subjectReport.campaignId}/reports/${subjectReport.id}`}>
            {!subjectReport.approved
              ? <Icon type="check-square" theme="filled" className="status-icon" />
              : <div className="empty-square" />}
            {' View Report'}
          </Link>
        </div>
      )}

      {approvalReports.length > 0
        && <CollapseItem key="approve_reports" title="Approve reports" list={approvalReports} />}
    </List>
  )
}

export default connect(ReportList)
