import React, { useState } from 'react'
import {
  List, Collapse, Icon, Modal, Progress,
} from 'antd'
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

function ReportList ({ approvalReports, subjectReport, percent, reportsCounters }) {
  const [showHelp, setShowHelp] = useState(false)
  return (
    <List
      className="column-list report-list"
      size="large"
      header={(
        <div className="header">
          <div className="letter-icon">R</div>
          <div className="caption">
            Reports
            <div className="progress-bars">
              <Progress
                className="progress-line"
                percent={percent}
                showInfo={false}
                strokeColor="#00B4AA"
              />
              <div className="value">{reportsCounters.completedReports} of {reportsCounters.totalReports}</div>
            </div>
          </div>
          <div className="help">
            <Icon type="question-circle" className="help-icon" onClick={() => setShowHelp(true)} />
          </div>
        </div>
      )}
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
        && <CollapseItem key="approve_reports" title={I18n.t('threesixty.approve_reports')} list={approvalReports} />}
      <Modal
        title={(
          <div className="help-modal-header">
            <div className="letter-icon">R</div>
            Reports help
          </div>
        )}
        visible={showHelp}
        onCancel={() => setShowHelp(false)}
        footer={null}
      >
        <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: I18n.t('threesixty.help.report') }} />
      </Modal>
    </List>
  )
}

export default connect(ReportList)
