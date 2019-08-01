const APPROVAL_STATUSES = {
  waiting: 'Need Approve',
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
    return I18n.t(`subjects.statuses.${status}`)
  },
  getReportStatus (status) {
    return REPORT_STATUSES[status] || REPORT_STATUSES.not_prepared
  },
}
