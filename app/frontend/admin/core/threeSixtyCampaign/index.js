import { takeEvery, put, select } from 'redux-saga/effects'
import { get as getSelectedTab } from './selectedParticipantTab'
import { getCurrentCampaignId } from './campaignDetails'
import { fetchSubjects } from './subjects'
import { fetchEvaluators } from './evaluators'
import { fetchManagers } from './managers'

const RESET = 'threeSixty/RESET'
const RESET_NOMINATIONS = 'threeSixty/RESET_NOMINATIONS'
const REMOVE_USER = 'threeSixty/REMOVE_USER'

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

export const removeUser = (campaignId, userId) => ({
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
  takeEvery(RESET, genReloadCurrentParticipantTab),
  takeEvery(REMOVE_USER, genReloadCurrentParticipantTab),
]
