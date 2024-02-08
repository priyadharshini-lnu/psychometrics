import _ from 'lodash'
import { takeLatest, put, select } from 'redux-saga/effects'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import dayjs from '~/utils/dayjs'
import { getCurrentCampaignId } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { createReducer } from '~/utils/redux'
import { updateIn } from '~/utils/immutable'
import recipientCriteria from './recipientCriteria'

interface Schedule {
  id: number
  scheduledDate: string
  name: string
  recipientCriteria: {}
}

interface Recipient {
  id: number
}
interface State {
  list: Schedule[]
  selectedId?: number
  recipients: []
}

const defaultState: State = {
  list: [],
  recipients: [],
}

export const get = state => _.get(state, ['threeSixtyCampaign', 'emailSchedules'])

export const FETCH_SCHEDULABLE_TEMPLATE = 'threeSixty/emailSchedules/FETCH_SCHEDULABLE_TEMPLATE'
export const FETCH_SINGLE = 'threeSixty/emailSchedules/FETCH_SINGLE'
export const UPDATE_FIELD = 'threeSixty/emailSchedules/UPDATE_FIELD'
export const UPDATE = 'threeSixty/emailSchedules/UPDATE'
export const CREATE = 'threeSixty/emailSchedules/CREATE'
export const CHANGE_SELECTED = 'threeSixty/emailSchedules/CHANGE_SELECTED'
export const FETCH_RECIPIENT_BY_CRITERIA = 'threeSixty/emailSchedules/FETCH_RECIPIENT_BY_CRITERIA'

export const updateField = (key: string, value) => ({ type: UPDATE_FIELD, payload: { key, value } })
export const changeSelected = (id: number) => ({ type: CHANGE_SELECTED, payload: { id } })

export const fetchSingle = (campaignId: number, emailScheduleId: number) => ({
  type: FETCH_SINGLE,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailScheduleId}`,
  },
})

export const fetchSchedulableTemplate = (
  campaignId: number, { selectedEmailTemplateId }: {selectedEmailTemplateId: number},
) => ({
  type: FETCH_SCHEDULABLE_TEMPLATE,
  campaignId,
  selectedEmailTemplateId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/schedulable_templates`,
  },
})

export const fecthRecipientsByCriteria = (campaignId: number, emailSchedule: Schedule) => ({
  type: FETCH_RECIPIENT_BY_CRITERIA,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/recipient_by_criteria`,
    debounce: 500,
    body: {
      emailName: emailSchedule.name,
      recipientCriteria: emailSchedule.recipientCriteria,
    },
  },
})

export const create = (
  campaignId: number, emailSchedule: Schedule, recipientIds: number,
) => ({
  type: CREATE,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/`,
    body: { ...emailSchedule, recipientIds },
  },
})

export const update = (campaignId: number, emailSchedule: Schedule, recipientIds: number) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailSchedule.id}`,
    body: { ...emailSchedule, recipientIds },
  },
})

type FetchSchedulableTemplate = ApiActionResponse<typeof fetchSchedulableTemplate>

function* genChangeSelectedId ({ requestAction: { selectedEmailTemplateId } }: FetchSchedulableTemplate) {
  yield put(changeSelected(selectedEmailTemplateId))
}

export function* genFecthRecipientsByCriteria (options: FetchSchedulableTemplate) {
  const emailSchedule = yield select((state) => {
    const emailSchedules = get(state)
    const selectedId = _.get(options, ['requestAction', 'selectedEmailTemplateId'], emailSchedules.selectedId)
    return _.find(emailSchedules.list, ({ id }) => id === selectedId)
  })
  const campaignId = yield select(getCurrentCampaignId)

  yield put(fecthRecipientsByCriteria(campaignId, emailSchedule))
}

export type FetchSchedultTemplateAction = ApiActionResponse<Schedule[]>
export type FetchSingleAction = ApiActionResponse<{
  emailSchedule: Schedule,
  recipients: Recipient[]
}>
export type FetchRecipientAction = ApiActionResponse<Recipient[]>
export type UpdateFieldAction = ReturnType<typeof updateField>
export type ChangeSelectedAction = ReturnType<typeof changeSelected>

const HANDLERS = {
  [FETCH_SCHEDULABLE_TEMPLATE]: (state: State, { response }: FetchSchedultTemplateAction) => {
    const scheduledDate = dayjs().format()
    const list = response.map(emailSchedule => ({ ...emailSchedule, scheduledDate }))
    return { ...state, list }
  },
  [FETCH_SINGLE]: (state: State, { response }: FetchSingleAction) => {
    const { emailSchedule, recipients } = response
    return {
      ...state, list: [emailSchedule], selectedId: emailSchedule.id, recipients,
    }
  },
  [FETCH_RECIPIENT_BY_CRITERIA]: (state: State, { response }: FetchRecipientAction) => ({
    ...state, recipients: response,
  }),
  [UPDATE_FIELD]: (state: State, { payload: { key, value } }: UpdateFieldAction) => updateIn(
    state,
    'list',
    list => _.map(list, (emailSchedule) => {
      if (emailSchedule.id !== state.selectedId) { return emailSchedule }
      return { ...emailSchedule, [key]: value }
    }),
  ),
  [CHANGE_SELECTED]: (state: State, { payload: { id } }: ChangeSelectedAction) => ({ ...state, selectedId: id }),
}

export default createReducer(HANDLERS, defaultState, (state: State, action) => {
  const index = _.findIndex(state.list, ({ id }) => id === state.selectedId)
  return updateIn(
    state, ['list', index, 'recipientCriteria'], state => recipientCriteria(state, action),
  )
})

export const watchers = [
  takeLatest(FETCH_SCHEDULABLE_TEMPLATE, genChangeSelectedId),
  takeLatest([FETCH_SCHEDULABLE_TEMPLATE, CHANGE_SELECTED], genFecthRecipientsByCriteria),
]
