import { takeEvery, put, select } from 'redux-saga/effects'
import { get as getSelectedTab } from './selectedParticipantTab'
import { get as getCampaignId } from './currentThreeSixtyCampaignId'
import { fetchSubjects } from './subjects'
import { fetchEvaluators } from './evaluators'
import { fetchManagers } from './managers'

const RESET = 'threeSixty/RESET'
const RESET_NOMINATIONS = 'threeSixty/RESET_NOMINATIONS'

export const reset = campaignId => ({
  type: RESET,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/reset`,
  },
})

export const resetAllNominations = campaignId => ({
  type: RESET_NOMINATIONS,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/reset_nominations`,
  },
})

function* genReloadCurrentParticipantTab () {
  const selectedTab = yield select(getSelectedTab)
  const campaignId = yield select(getCampaignId)
  switch (selectedTab) {
    case 'subjects':
      return yield put(fetchSubjects(campaignId))
    case 'evaluators':
      return yield put(fetchEvaluators(campaignId))
    case 'managers':
      return yield put(fetchManagers(campaignId))
    default:
      return null
  }
}

export const watchers = [
  takeEvery(RESET_NOMINATIONS, genReloadCurrentParticipantTab),
]
