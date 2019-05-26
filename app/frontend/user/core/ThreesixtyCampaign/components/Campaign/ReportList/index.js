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
      <Icon
        type="check-circle"
        theme="twoTone"
        twoToneColor={item.approval_status === 'approved' ? '#52c41a' : '#ccc'}
      />
      {' '}
      {userPresenter.getFullNameWithEmail(item.user)}
    </Link>
  </List.Item>
)

const CollapseItem = ({ title, list }) => (
  <Collapse bordered={false}>
    <Panel header={title} forceRender>
      <List
        size="large"
        bordered
        dataSource={list}
        renderItem={ReportItem}
      />
    </Panel>
  </Collapse>
)

function ReportList ({ approvalReports, subjectReport }) {
  return (
    <List
      className="report-list"
      size="large"
      header={<div>Reports</div>}
      bordered
    >
      {subjectReport && (
        <div className="report-row">
          <Link to={`/campaigns/${subjectReport.campaignId}/reports/${subjectReport.id}`}>
            <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
            {' View Report'}
          </Link>
        </div>
      )}

      <CollapseItem key="approve_reports" title="Approve reports" list={approvalReports} />
    </List>
  )
}

export default connect(ReportList)
