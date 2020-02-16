/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  List, Collapse, Icon, Modal, Progress, Tooltip,
} from 'antd'
import ConfirmationModal from 'components/ConfirmationModal'
import userPresenter from 'presenters/userPresenter'
import connect from './connect'
import './styles.scss'

const { Panel } = Collapse

function ReportList ({
  approvalReports, subjectReport, percent, reportsCounters,
  options: { approval: { managerApprovesReports } },
  instructions, history,
}) {
  const [showHelp, setShowHelp] = useState(false)
  const reportHelp = _.find(instructions, { name: 'report_help' })
  const [reportToShow, setReportToShow] = useState(null)

  const redirectToReport = (report) => {
    history.push(`/campaigns/${report.campaignId}/reports/${report.id}`)
  }

  const showReport = (report) => {
    if (report.evalautionCompletedForSubject) {
      redirectToReport(report)
    } else {
      setReportToShow(report)
    }
  }

  return (
    <>
      {reportToShow && (
      <ConfirmationModal
        title={I18n.t('threesixty.close_evaluation_modal.title')}
        message={I18n.t('threesixty.close_evaluation_modal.message',
          {
            pronoun_or_name:
            reportToShow.isSelf ? I18n.t('threesixty.you') : userPresenter.getFullName(reportToShow.user),
          })
        }
        onConfirm={() => redirectToReport(reportToShow)}
        onCancel={() => setReportToShow(null)}
      />
      )}
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
                <div className="value">
                  {reportsCounters.completedReports}
                  {' '}
                  of
                  {' '}
                  {reportsCounters.totalReports}
                </div>
              </div>
            </div>
            {reportHelp && (
            <div className="help">
              <Icon type="question-circle" className="help-icon" onClick={() => setShowHelp(true)} />
            </div>
            )}
          </div>
        )}
        bordered
      >
        {subjectReport && (
          <div className="report-row">
            <a onClick={() => showReport(subjectReport)}>
              {!subjectReport.approved
                ? <Icon type="check-square" theme="filled" className="status-icon" />
                : <div className="empty-square" />}
              {I18n.t('threesixty.view_my_report')}
            </a>
          </div>
        )}

        {approvalReports.length > 0
          && (
          <CollapseItem
            key="view_or_approve_reports"
            title={managerApprovesReports ? I18n.t('threesixty.approve_reports') : I18n.t('threesixty.view_reports')}
            list={approvalReports}
            showReport={showReport}
          />
          )}
        {reportHelp && (
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
          <div className="help-modal-body" dangerouslySetInnerHTML={{ __html: reportHelp.content }} />
        </Modal>
        )}
      </List>
    </>
  )
}

const ReportItem = ({ item, showReport }) => (
  <List.Item>
    <a onClick={showReport}>
      {!item.approval_status
        ? <Icon type="check-square" theme="filled" className="status-icon" />
        : <div className="empty-square" />}
      {' '}
      <Tooltip placement="topLeft" title={item.user.email}>
        {userPresenter.selfUserName(item)}
      </Tooltip>
    </a>
  </List.Item>
)

const CollapseItem = ({ title, list, showReport }) => (
  <Collapse bordered={false} accordion={false} defaultActiveKey="panel">
    <Panel header={title} forceRender key="panel">
      <List
        size="large"
        dataSource={list}
        renderItem={item => <ReportItem item={item} showReport={() => showReport(item)} />}
      />
    </Panel>
  </Collapse>
)

export default connect(withRouter(ReportList))
