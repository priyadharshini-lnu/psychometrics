import _ from 'lodash'

export const getReportOption = state => _.get(state, ['threeSixtyCampaign', 'reportOptions'])
export const getAccessOption = state => _.get(getReportOption(state), ['access'])
export const getApprovalOption = state => _.get(getReportOption(state), ['approval'])
export const getAvailabilityOption = state => _.get(getReportOption(state), ['availability'])
