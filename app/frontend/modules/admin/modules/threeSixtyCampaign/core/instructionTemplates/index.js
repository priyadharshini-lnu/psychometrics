import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const get = state => _.get(state, ['threeSixtyCampaign', 'instructionTemplates'])

const defaultState = {
  list: [],
}

export const FETCH = 'threeSixty/instructionTemplates/FETCH'
export const UPDATE = 'threeSixty/instructionTemplates/UPDATE'
export const SAVE = 'threeSixty/instructionTemplates/SAVE'

export const update = (id, key, value) => ({ type: UPDATE, payload: { id, key, value } })

export const fetch = campaignId => ({
  type: FETCH,
  campaignId,
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
  [UPDATE]: (state, { payload: { id, key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (instructionTemplate) => {
      if (instructionTemplate.id !== id) { return instructionTemplate }
      return { ...instructionTemplate, [key]: value }
    }),
  ),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
