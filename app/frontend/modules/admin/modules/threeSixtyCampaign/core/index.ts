import { takeEvery, put, select } from 'redux-saga/effects'
import { get as getSelectedTab } from './selectedParticipantTab'
import { getCurrentCampaignId } from './campaignDetails'
import { fetchSubjects } from './subjects'
import { fetchEvaluators } from './evaluators'
import { fetchManagers } from './managers'

const RESET = 'threeSixty/RESET'
const RESET_NOMINATIONS = 'threeSixty/RESET_NOMINATIONS'
const RESCORE_ASSESSMENT = 'threeSixty/RESCORE_ASSESSMENT'
const REGENERATE_REPORTS = 'threeSixty/REGENERATE_REPORTS'
const REMOVE_USER = 'threeSixty/REMOVE_USER'
const EXPORT_COMPLETION_STATUSES = 'threeSixty/EXPORT_COMPLETION_STATUSES'

export const reset = (campaignId: number, removeLicenceUsage: boolean) => ({
  type: RESET,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/reset`,
    body: { removeLicenceUsage },
  },
})

export const resetAllNominations = (campaignId: number) => ({
  type: RESET_NOMINATIONS,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/reset_nominations`,
  },
})

export const rescoreAssessment = (campaignId: number) => ({
  type: RESCORE_ASSESSMENT,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/rescore_assessment`,
  },
})

export const regenerateReports = (campaignId: number) => ({
  type: REGENERATE_REPORTS,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/regenerate_reports`,
  },
})


export const exportCompletionStatuses = (campaignId: number) => ({
  type: EXPORT_COMPLETION_STATUSES,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/export_completion_status`,
  },
})

export const exportRawResults = (campaignId: number) => ({
  type: EXPORT_COMPLETION_STATUSES,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/export_results`,
  },
})

export const exportThreeSixtyScores = (campaignId: number) => ({
  type: EXPORT_COMPLETION_STATUSES,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/export_threesixty_scores`,
  },
})

export const removeUser = (campaignId: number, userId: number) => ({
  type: REMOVE_USER,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/remove_user`,
    body: {
      userId,
    },
  },
})

function* genReloadCurrentParticipantTab () {
  const selectedTab = yield select(getSelectedTab)
  const campaignId = yield select(getCurrentCampaignId)
  switch (selectedTab) {
    case '/participants/subjects':
      return yield put(fetchSubjects(campaignId))
    case '/participants/evaluators':
      return yield put(fetchEvaluators(campaignId))
    case '/participants/managers':
      return yield put(fetchManagers(campaignId))
    default:
      return null
  }
}

export const watchers = [
  takeEvery(RESET_NOMINATIONS, genReloadCurrentParticipantTab),
  takeEvery(RESCORE_ASSESSMENT, genReloadCurrentParticipantTab),
  takeEvery(RESET, genReloadCurrentParticipantTab),
  takeEvery(REMOVE_USER, genReloadCurrentParticipantTab),
]
