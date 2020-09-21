import {
  takeLatest, put, takeEvery,
} from 'redux-saga/effects'
import { updateModal } from 'modules/admin/core/ui/modals'
import { AnyAction } from 'redux'
import {
  ACTIVATE_UNIVERSAL_LINK, REGENERATE_UNIVERSAL_LINK, REMOVE,
} from './actions'
import { removeCamapignReports } from '../reports'


function* genOpenUniversalLinkModal ({ response, requestAction: { campaignId } }: AnyAction) {
  yield put(updateModal('UniversalLinkModal',
    {
      campaignId,
      campaignAssessmentId: response.id,
      universalLink: response.universalLink,
    }))
}

export const watchers = [
  takeLatest(ACTIVATE_UNIVERSAL_LINK, genOpenUniversalLinkModal),
  takeLatest(REGENERATE_UNIVERSAL_LINK, genOpenUniversalLinkModal),
  takeEvery(REMOVE, removeCamapignReports),
]
