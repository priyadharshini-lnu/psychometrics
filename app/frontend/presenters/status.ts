const { I18n } = window

export default {
  getApprovalStatus (status: string) {
    return status ? I18n.t(`subjects.approval_statuses.${status}`) : I18n.t('subjects.approval_statuses.waiting')
  },
  getStatus (status: string) {
    return status ? I18n.t(`admin.${status}`) : I18n.t('admin.not_completed')
  },
  getReportStatus (status: string) {
    return status ? I18n.t(`subjects.report_statuses.${status}`) : I18n.t('subjects.report_statuses.not_prepared')
  },
}
