import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const get = state => _.get(state, ['threeSixtyCampaign', 'instructionTemplates'])
export const getSelectedId = state => _.get(state, ['threeSixtyCampaign', 'instructionTemplates', 'selectedId'])
export const getSelected = (state) => {
  const selectedId = getSelectedId(state)
  return _.find(get(state).list, ({ id }) => id === selectedId)
}

const defaultState = {
  list: [],
}

export const FETCH = 'threeSixty/instructionTemplates/FETCH'
export const UPDATE = 'threeSixty/instructionTemplates/UPDATE'
export const SAVE = 'threeSixty/instructionTemplates/SAVE'
export const CHANGE_SELECTED = 'threeSixty/instructionTemplates/CHANGE_SELECTED'

export const update = (key, value) => ({ type: UPDATE, payload: { key, value } })
export const changeSelected = id => ({ type: CHANGE_SELECTED, payload: { id } })

export const fetch = (campaignId, { selectedId }) => ({
  type: FETCH,
  campaignId,
  selectedId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates`,
  },
})

export const save = (campaignId, instructionTemplate) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates/${instructionTemplate.id}`,
    body: { instructionTemplate },
  },
})


const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
  [UPDATE]: (state, { payload: { key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (instructionTemplate) => {
      if (instructionTemplate.id !== state.selectedId) { return instructionTemplate }
      return { ...instructionTemplate, [key]: value }
    }),
  ),
  [CHANGE_SELECTED]: (state, { payload: { id } }) => ({ ...state, selectedId: id }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
