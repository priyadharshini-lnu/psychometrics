import * as t from 'io-ts'

import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'

export const FETCH = 'campaignList/FETCH'

const CommonCampaignTR = t.type({
  id: t.number,
  name: t.string,
  type: t.string,
  status: t.string,
  completionPercentage: t.number,
  progressStatus: t.string,
  userReportsAvailable: t.boolean,
  description: t.union([t.null, t.string]),
  isSystemCheckEnabled: t.boolean,
  allowContinueWithWarning: t.boolean,
  systemCheckValidity: t.union([t.null, t.number]),
  systemCheckStatus: t.union([t.null, t.type({
    isValid: t.boolean,
  })]),
})
const ThreesixtyCampaignTR = t.type({
  id: t.number,
  timing: t.union([t.string, t.null]),
  assessmentName: t.string,
  isSystemCheckEnabled: t.boolean,
  allowContinueWithWarning: t.boolean,
  systemCheckValidity: t.union([t.null, t.number]),
  systemCheckStatus: t.union([t.null, t.type({
    isValid: t.boolean,
  })]),
  progressStatus: t.string,
  evaluationsCounters: t.type({
    totalEvaluators: t.number,
    totalEvaluations: t.number,
    completedEvaluations: t.number,
    completedEvaluators: t.number,
  }),
  nominationsCounters: t.type({
    totalNominations: t.number,
    completedNominations: t.number,
  }),
  reportsCounters: t.type({
    totalReports: t.number,
    completedReports: t.number,
  }),
})

const CampaignsTR = (t.array(t.union([CommonCampaignTR, ThreesixtyCampaignTR])))

export type Campaigns = t.TypeOf<typeof CampaignsTR>

export const fetchCampaigns = (): ApiAction<Campaigns> => ({
  type: FETCH,
  request: {
    url: '/dashboard',
    typedResponse: CampaignsTR,
    loader: true,
  },
})

export const defaultState = []

const HANDLERS = {
  [FETCH]: (_, { response }: ApiActionResponse<Campaigns>) => response,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
