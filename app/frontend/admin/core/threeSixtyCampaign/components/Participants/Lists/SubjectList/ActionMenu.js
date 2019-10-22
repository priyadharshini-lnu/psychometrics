import React from 'react'
import { Menu, message } from 'antd'

const ActionsMenu = ({
  subjectId,
  campaignId,
  update,
  user,
  remove,
  removeUser,
  downloadReport,
  openModal,
  editUser,
  onUserUpdate,
}) => {
  const updateSubject = (subjectId, data, cofirmationMessage) => {
    // eslint-disable-next-line no-alert
    if (confirm(cofirmationMessage)) update(campaignId, subjectId, data)
  }

  const removeUserWithConfirmation = () => {
    if (confirm(I18n.t('threesixty.participant_list.confirmation_messages.remove_from_campaign'))) {
      removeUser(campaignId, user.id)
    }
  }

  const approveReport = (subjectId) => {
    updateSubject(
      subjectId,
      { report_approval_status: 'approved' },
      I18n.t('threesixty.participant_list.confirmation_messages.approve_report'),
    )
  }

  const removeReportApprove = (subjectId) => {
    updateSubject(
      subjectId,
      { report_approval_status: 'waiting' },
      I18n.t('threesixty.participant_list.confirmation_messages.remove_report_approval'),
    )
  }

  const releaseReport = (subjectId) => {
    updateSubject(
      subjectId,
      { report_release_status: 'released' },
      I18n.t('threesixty.participant_list.confirmation_messages.release_report_confimation'),
    )
  }

  const holdReport = (subjectId) => {
    updateSubject(
      subjectId,
      { report_release_status: 'on_hold' },
      I18n.t('threesixty.participant_list.confirmation_messages.hold_report'),
    )
  }

  const removeReleasedHoldStatus = (subjectId) => {
    updateSubject(
      subjectId,
      { report_release_status: 'waiting' },
      I18n.t('threesixty.participant_list.confirmation_messages.remove_release_hold'),
    )
  }

  const markEvaluationAsComplete = (subjectId) => {
    updateSubject(
      subjectId,
      { evaluation_status: 'completed' },
      I18n.t('threesixty.participant_list.confirmation_messages.mark_evaluation_done'),
    )
  }

  const unmarkEvaluationAsComplete = (subjectId) => {
    updateSubject(
      subjectId,
      { evaluation_status: 'in_progress' },
      I18n.t('threesixty.participant_list.confirmation_messages.umark_evaluation_as_complete'),
    )
  }

  const removeSubject = (subjectId) => {
    // eslint-disable-next-line no-alert
    if (confirm(I18n.t('threesixty.participant_list.confirmation_messages.remove_subject'))) {
      remove(campaignId, subjectId)
    }
  }

  const requestDownloadReport = (campaignId, subjectId) => {
    downloadReport(campaignId, subjectId)
      .then(({ response }) => {
        if (response.success) {
          message.success(
            I18n.t('threesixty.participant_list.confirmation_messages.report_generation_message'),
            3,
          )
        }
      })
  }

  const openResultsModal = () => {
    openModal('ParticipantModal', {
      user,
      activeKey: 'results',
      onClose: () => {},
    })
  }

  const openUserEditModal = () => {
    editUser(user)
    openModal('UserEditModal', {
      onUserUpdate,
    })
  }

  return (
    <Menu>
      <Menu.Item key="0">
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/participants/${
            user.id
          }/spoof`}
        >
          {I18n.t('threesixty.participant_list.actions.login')}
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <div
          onClick={openUserEditModal}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.edit')}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1">
        <a href={`/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/reports`}>
          {I18n.t('threesixty.participant_list.actions.view_report')}
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <div
          onClick={() => requestDownloadReport(campaignId, subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.download_report')}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2.5">
        <div
          onClick={() => openResultsModal()}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.view_responses')}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">
        <div
          onClick={() => approveReport(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.approve_report')}
        </div>
      </Menu.Item>
      <Menu.Item key="4">
        <div
          onClick={() => removeReportApprove(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.remove_report_approval')}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="5">
        <div
          onClick={() => releaseReport(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.release_report')}
        </div>
      </Menu.Item>
      <Menu.Item key="6">
        <div onClick={() => holdReport(subjectId)} role="button" tabIndex={-1}>
          {I18n.t('threesixty.participant_list.actions.hold_report')}
        </div>
      </Menu.Item>
      <Menu.Item key="7">
        <div
          onClick={() => removeReleasedHoldStatus(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.remove_report_hold_release_report')}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="8">
        <div
          onClick={() => markEvaluationAsComplete(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.mark_as_done')}
        </div>
      </Menu.Item>
      <Menu.Item key="9">
        <div
          onClick={() => unmarkEvaluationAsComplete(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.unmark_as_done')}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="10">
        <div
          onClick={() => removeSubject(subjectId)}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.remove_subject')}
        </div>
      </Menu.Item>
      <Menu.Item key="11">
        <div
          onClick={removeUserWithConfirmation}
          role="button"
          tabIndex={-1}
        >
          {I18n.t('threesixty.participant_list.actions.remove_campaign')}
        </div>
      </Menu.Item>
    </Menu>
  )
}

export default ActionsMenu
