const APPROVAL_STATUSES = {
  waiting: 'Needs Approval',
  approved: 'Approved',
  denied: 'Denied',
}

const REPORT_STATUSES = {
  not_prepared: 'Not Ready',
  generating: 'Generating',
  failed: 'Failed',
  prepared: 'Done',
}

export default {
  getApprovalStatus (status) {
    return APPROVAL_STATUSES[status] || APPROVAL_STATUSES.waiting
  },
  getStatus (status) {
    return status ? I18n.t(`subjects.statuses.${status}`) : I18n.t('subjects.statuses.not_completed')
  },
  getReportStatus (status) {
    return REPORT_STATUSES[status] || REPORT_STATUSES.not_prepared
  },
}
