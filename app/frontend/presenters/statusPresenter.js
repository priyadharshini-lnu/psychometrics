const APPROVAL_STATUSES = {
  waiting: 'Need Approve',
  approved: 'Approved',
  denied: 'Denied',
}

const STATUSES = {
  completed: 'Completed',
  not_completed: 'Not Completed',
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
    return STATUSES[status] || STATUSES.not_completed
  },
  getReportStatus (status) {
    return REPORT_STATUSES[status] || REPORT_STATUSES.not_prepared
  },
}
