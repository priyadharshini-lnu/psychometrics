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
  permissions,
  regenerateReport,
}) => {
  const updateSubject = (subjectId, data, cofirmationMessage) => {
    // eslint-disable-next-line no-alert
    if (confirm(cofirmationMessage)) update(campaignId, subjectId, data)
  }

  const removeUserWithConfirmation = () => {
    // eslint-disable-next-line no-alert
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
      I18n.t('threesixty.participant_list.confirmation_messages.release_report'),
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
    openModal('ResetSubjectModal', {
      onConfirm: removeLicenceUsage => remove(campaignId, subjectId, removeLicenceUsage),
    })
  }

  const requestDownloadReport = (campaignId, subjectId) => {
    downloadReport(campaignId, subjectId)
      .then(({ response }) => {
        if (response.success) {
          message.success(
            I18n.t('threesixty.participant_list.report_generation_message'),
            3,
          )
        }
      })
  }

  const requestRegenerateReport = (campaignId, subjectId) => {
    regenerateReport(campaignId, subjectId)
      .then(({ response }) => {
        if (response === 'ok') {
          message.success(
            I18n.t('threesixty.participant_list.report_generation_message'),
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

  const menuItems = [
    permissions.login && {
      key: 'login',
      label: (
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/participants/${
            user.id
          }/spoof`}
        >
          {I18n.t('threesixty.participant_list.actions.login')}
        </a>),
    },
    permissions.editUser && {
      key: 'edit_user',
      label: I18n.t('threesixty.participant_list.actions.edit'),
    },
    { type: 'divider' },
    permissions.viewReport && {
      key: 'view_report',
      label: (
        <a href={`/administration/threesixty_campaigns/${campaignId}/subjects/${subjectId}/reports`}>
          {I18n.t('threesixty.participant_list.actions.view_report')}
        </a>),
    },
    permissions.downloadReport && {
      key: 'download_report',
      label: I18n.t('threesixty.participant_list.actions.download_report'),
    },
    permissions.regenerateReport && {
      key: 'regenerate_report',
      label: I18n.t('threesixty.participant_list.actions.regenerate_report'),
    },
    { type: 'divider' },
    permissions.viewResponses && {
      key: 'view_responses',
      label: I18n.t('threesixty.participant_list.actions.view_responses'),
    },
    { type: 'divider' },
    permissions.approveReport && {
      key: 'approve_report',
      label: I18n.t('threesixty.participant_list.actions.approve_report'),
    },
    permissions.removeReportApproval && {
      key: 'remove_report_approval',
      label: I18n.t('threesixty.participant_list.actions.remove_report_approval'),
    },
    { type: 'divider' },
    permissions.releaseReport && {
      key: 'release_report',
      label: I18n.t('threesixty.participant_list.actions.release_report'),
    },
    permissions.holdReport && {
      key: 'hold_report',
      label: I18n.t('threesixty.participant_list.actions.hold_report'),
    },
    permissions.removeReportHoldRelease && {
      key: 'remove_report_hold_release_report',
      label: I18n.t('threesixty.participant_list.actions.remove_report_hold_release_report'),
    },
    { type: 'divider' },
    permissions.markAsDone && {
      key: 'mark_as_done',
      label: I18n.t('threesixty.participant_list.actions.mark_as_done'),
    },
    permissions.unmarkAsDone && {
      key: 'unmark_as_done',
      label: I18n.t('threesixty.participant_list.actions.unmark_as_done'),
    },
    { type: 'divider' },
    permissions.removeSubject && {
      key: 'remove_subject',
      label: I18n.t('threesixty.participant_list.actions.remove_subject'),
    },
    permissions.removeFromCampaign && {
      key: 'remove_campaign',
      label: I18n.t('threesixty.participant_list.actions.remove_campaign'),
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit_user') {
      return openUserEditModal()
    }
    if (key === 'download_report') {
      return requestDownloadReport(campaignId, subjectId)
    }
    if (key === 'regenerate_report') {
      return requestRegenerateReport(campaignId, subjectId)
    }
    if (key === 'view_responses') {
      return openResultsModal()
    }
    if (key === 'approve_report') {
      return approveReport(subjectId)
    }
    if (key === 'remove_report_approval') {
      return removeReportApprove(subjectId)
    }
    if (key === 'release_report') {
      return releaseReport(subjectId)
    }
    if (key === 'hold_report') {
      return holdReport(subjectId)
    }
    if (key === 'remove_report_hold_release_report') {
      return removeReleasedHoldStatus(subjectId)
    }
    if (key === 'mark_as_done') {
      return markEvaluationAsComplete(subjectId)
    }
    if (key === 'unmark_as_done') {
      return unmarkEvaluationAsComplete(subjectId)
    }
    if (key === 'remove_subject') {
      return removeSubject(subjectId)
    }
    if (key === 'remove_campaign') {
      return removeUserWithConfirmation()
    }
  }

  return (
    <Menu onClick={handleMenuClick} items={menuItems} />
  )
}

export default ActionsMenu
