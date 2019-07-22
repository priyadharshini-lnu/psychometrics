import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { takeLatest, put, select } from 'redux-saga/effects'
import { get as getCurrentCampaignId } from 'admin/core/threeSixtyCampaign/currentThreeSixtyCampaignId'
import recipientCriteria from './recipientCriteria'

const defaultState = {
  list: [],
}

export const get = state => _.get(state, ['threeSixtyCampaign', 'emailSchedules'])

export const FETCH = 'threeSixty/emailSchedules/FETCH'
export const UPDATE = 'threeSixty/emailSchedules/UPDATE'
export const CREATE = 'threeSixty/emailSchedules/CREATE'
export const CHANGE_SELECTED = 'threeSixty/emailSchedules/CHANGE_SELECTED'
export const FETCH_RECIPIENT_BY_CRITERIA = 'threeSixty/emailSchedules/FETCH_RECIPIENT_BY_CRITERIA'

export const update = (key, value) => ({ type: UPDATE, payload: { key, value } })
export const changeSelected = id => ({ type: CHANGE_SELECTED, payload: { id } })

export const fetchSchedulableTemplate = (campaignId, { selectedEmailTemplateId }) => ({
  type: FETCH,
  campaignId,
  selectedEmailTemplateId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/schedulable_templates`,
  },
})

export const fecthRecipientsByCriteria = (campaignId, emailSchedule) => ({
  type: FETCH_RECIPIENT_BY_CRITERIA,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/receipient_by_criteria`,
    body: {
      emailName: emailSchedule.name,
      recipientCriteria: emailSchedule.recipientCriteria,
    },
  },
})

export const create = (campaignId, emailSchedule) => ({
  type: CREATE,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/`,
    body: { emailSchedule },
  },
})

function* genChangeSelectedId ({ requestAction: { selectedEmailTemplateId } }) {
  yield put(changeSelected(selectedEmailTemplateId))
}

export function* genFecthRecipientsByCriteria (options = {}) {
  const emailSchedule = yield select((state) => {
    const emailSchedules = get(state)
    const selectedId = _.get(options, ['requestAction', 'selectedEmailTemplateId'], emailSchedules.selectedId)
    return _.find(emailSchedules.list, ({ id }) => id === selectedId)
  })
  const campaignId = yield select(getCurrentCampaignId)

  yield put(fecthRecipientsByCriteria(campaignId, emailSchedule))
}

const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
  [FETCH_RECIPIENT_BY_CRITERIA]: (state, { response }) => ({ ...state, recipients: response }),
  [UPDATE]: (state, { payload: { key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (emailSchedule) => {
      if (emailSchedule.id !== state.selectedId) { return emailSchedule }
      return { ...emailSchedule, [key]: value }
    }),
  ),
  [CHANGE_SELECTED]: (state, { payload: { id } }) => ({ ...state, selectedId: id }),
}

export default function reducer (state = defaultState, action) {
  const index = _.findIndex(state.list, ({ id }) => id === state.selectedId)
  const stateFromInnerReducer = updateIn(
    state, ['list', index, 'recipientCriteria'], state => recipientCriteria(state, action),
  )

  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}

export const watchers = [
  takeLatest(FETCH, genChangeSelectedId),
  takeLatest([FETCH, CHANGE_SELECTED], genFecthRecipientsByCriteria),
]
