import {
  takeLatest, put,
} from 'redux-saga/effects'
import { AnyAction } from 'redux'
import { updateModal } from '~/modules/admin/core/ui/modals'
import {
  REGENERATE_UNIVERSAL_LINK,
} from './actions'


function* genOpenUniversalLinkModal ({ response, requestAction: { campaignId } }: AnyAction) {
  yield put(updateModal('UniversalLinkModal',
    {
      campaignId,
      campaignAssessmentId: response.id,
      universalLink: response.universalLink,
    }))
}

export const watchers = [
  takeLatest(REGENERATE_UNIVERSAL_LINK, genOpenUniversalLinkModal),
]
