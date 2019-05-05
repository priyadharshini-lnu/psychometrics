const APPROVAL_STATUSES = {
  waiting: 'Need Approve',
  approved: 'Approved',
  denied: 'Denied',
}

const STATUSES = {
  completed: 'Completed',
  not_completed: 'Not Completed',
}

export default {
  getApprovalStatus (status) {
    return APPROVAL_STATUSES[status] || APPROVAL_STATUSES.waiting
  },
  getStatus (status) {
    return STATUSES[status] || STATUSES.not_completed
  },

}
