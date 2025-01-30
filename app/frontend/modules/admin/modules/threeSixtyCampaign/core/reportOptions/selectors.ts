import _ from 'lodash'

export const getReportOption = state => _.omit(_.get(state,
  ['threeSixtyCampaign', 'reportOptions'], {}), ['languages'])
export const getAccessOption = state => _.get(getReportOption(state), 'access')
export const getApprovalOption = state => _.get(getReportOption(state), 'approval')
export const getAvailabilityOption = state => _.get(getReportOption(state), 'availability')
export const getAvailabilityConditions = state => _.get(getAvailabilityOption(state), 'conditions')
export const getReportLanguages = state => _.get(state, ['threeSixtyCampaign', 'reportOptions', 'languages'])
