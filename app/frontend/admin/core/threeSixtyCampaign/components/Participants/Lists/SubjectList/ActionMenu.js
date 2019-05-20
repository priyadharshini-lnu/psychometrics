import React from 'react'
import { Menu } from 'antd'

const ActionsMenu = ({
  subjectId, campaignId, update, user, remove,
}) => {
  const updateSubject = (subjectId, data, cofirmationMessage) => {
    // eslint-disable-next-line no-alert
    if (confirm(cofirmationMessage)) update(campaignId, subjectId, data)
  }

  const approveReport = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to approve report?'
    updateSubject(subjectId, { report_approval_status: 'approved' }, confirmationMessage)
  }

  const removeReportApprove = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to remove report approval?'
    updateSubject(subjectId, { report_approval_status: 'waiting' }, confirmationMessage)
  }

  const releaseReport = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to release report?'
    updateSubject(subjectId, { report_release_status: 'released' }, confirmationMessage)
  }

  const holdReport = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to release report?'
    updateSubject(subjectId, { report_release_status: 'on_hold' }, confirmationMessage)
  }

  const removeReleasedHoldStatus = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to remove Release/Hold status?'
    updateSubject(subjectId, { report_release_status: 'waiting' }, confirmationMessage)
  }

  const markEvaluationAsComplete = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to mark evaluation as done?'
    updateSubject(subjectId, { evaluation_status: 'completed' }, confirmationMessage)
  }

  const unmarkEvaluationAsComplete = (subjectId) => {
    const confirmationMessage = 'Are you sure you want to unmark evaluation as done?'
    updateSubject(subjectId, { evaluation_status: 'in_progress' }, confirmationMessage)
  }

  const removeSubject = (subjectId) => {
    const cofirmationMessage = 'Are you sure you want to remove subject with email from campaign'
    // eslint-disable-next-line no-alert
    if (confirm(cofirmationMessage)) remove(campaignId, subjectId)
  }

  return (
    <Menu>
      <Menu.Item key="0">
        <a href={`/administration/threesixty_campaigns/${campaignId}/participants/${user.id}/spoof`}>Login</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="nth">View Report</a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">
        <div onClick={() => approveReport(subjectId)} role="button" tabIndex={-1}>
          Approve Report...
        </div>
      </Menu.Item>
      <Menu.Item key="4">
        <div onClick={() => removeReportApprove(subjectId)} role="button" tabIndex={-1}>
          Remove Report Approval...
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="5">
        <div onClick={() => releaseReport(subjectId)} role="button" tabIndex={-1}>
          Release Report..
        </div>
      </Menu.Item>
      <Menu.Item key="6">
        <div onClick={() => holdReport(subjectId)} role="button" tabIndex={-1}>
          Hold Report...
        </div>
      </Menu.Item>
      <Menu.Item key="7">
        <div onClick={() => removeReleasedHoldStatus(subjectId)} role="button" tabIndex={-1}>
          Remove Report Hold/Release..
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="8">
        <div onClick={() => markEvaluationAsComplete(subjectId)} role="button" tabIndex={-1}>
          Mark As Done...
        </div>
      </Menu.Item>
      <Menu.Item key="9">
        <div onClick={() => unmarkEvaluationAsComplete(subjectId)} role="button" tabIndex={-1}>
          Unmark As Done...
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="10">
        <div onClick={() => removeSubject(subjectId)} role="button" tabIndex={-1}>
          Remove From Project...
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default ActionsMenu
