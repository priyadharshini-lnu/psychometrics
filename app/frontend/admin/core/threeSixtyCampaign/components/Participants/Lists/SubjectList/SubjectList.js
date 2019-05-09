import React, { useEffect } from 'react'
import {
  Table, Dropdown, Icon, Row, Col,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import css from './SubjectList.scss'
import ActionsMenu from './ActionsMenu'
import ToolsDropdown from '../ToolsDropdown'
import CreateSubjectsDropdown from './CreateSubjectsDropdown'
import CreateSubjectModal from './CreateSubjectModal'

const { Column } = Table

export default function SubjectList ({
  fetchSubjects,
  update,
  remove,
  subjects,
  openModal,
  match: {
    params: { campaignId },
  },
  match,
}) {
  useEffect(() => {
    fetchSubjects(campaignId)
  }, [])

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
    <>
      <Row>
        <Col span={4} className="pls">
          <Icon type="user" />
          <span className="mlm">{`${subjects.length} Subjects`}</span>
        </Col>
        <Col span={6} offset={14} className="text-align-r">
          <ToolsDropdown />
          <CreateSubjectsDropdown />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            className="mtm"
            rowKey="id"
            dataSource={subjects}
            pagination={false}
            onRow={record => ({
              onClick: (e) => {
                if (['TR', 'TD'].includes(e.target.tagName)) {
                  openModal('ParticipantModal', { user: record.user, onClose: () => fetchSubjects(campaignId) })
                }
              },
            })}
          >
            <Column title="Name" key="fullName" render={({ user }) => userPresenter.getFullName(user)} />
            <Column title="Email" dataIndex="user.email" key="email" />
            <Column title="Evaluations Received" dataIndex="evaluators" key="received_evaluations" />
            <Column title="Evaluations Completed" dataIndex="evaluations" key="completed_evaluations" />
            <Column title="Report Status" dataIndex="reportStatus" key="report_status" />
            <Column title="Status" dataIndex="status" key="status" />

            <Column
              key="action"
              render={({ id, user: { email } }) => (
                <Dropdown
                  overlay={() => ActionsMenu({
                    subjectId: id,
                    email,
                    campaignId,
                    approveReport,
                    removeReportApprove,
                    releaseReport,
                    holdReport,
                    removeReleasedHoldStatus,
                    markEvaluationAsComplete,
                    unmarkEvaluationAsComplete,
                    removeSubject,
                  })}
                  trigger={['click']}
                >
                  <div className={css.actions}>
                    <Icon type="ellipsis" />
                  </div>
                </Dropdown>
              )}
            />
          </Table>
        </Col>
      </Row>
      <CreateSubjectModal match={match} />
    </>
  )
}
