import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import * as t from 'io-ts'

export const get = state => _.get(state, ['threeSixtyCampaign', 'instructionTemplates'])

const defaultState = {
  list: [],
  listWithLocales: [],
}

export const FETCH = 'threeSixty/instructionTemplates/FETCH'
export const UPDATE = 'threeSixty/instructionTemplates/UPDATE'
export const SAVE = 'threeSixty/instructionTemplates/SAVE'
export const FETCH_BY_LOCALES = 'threeSixty/instructionTemplates/FETCH_BY_LOCALES'

const Locale = t.type({
  content: t.string, locale: t.string, id: t.number,
})
const LocaleList = t.array(Locale)


export const update = (id, key, value, locale) => ({
  type: UPDATE,
  payload: {
    id, key, value, locale,
  },
})

export const fetch = campaignId => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates`,
  },
})

export const fetchByLocales = (campaignId, id, locales) => ({
  type: FETCH_BY_LOCALES,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates/${id}`,
    body: { locales: locales.filter(l => l) },
    typedResponse: LocaleList,
  },
})

export const save = (campaignId, instructionTemplate, locale) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates/${instructionTemplate.id}`,
    body: { instructionTemplate, locale },
  },
})


const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
  [FETCH_BY_LOCALES]: (state, { response }) => {
    const listWithLocales = response.map(
      resItem => state.listWithLocales.find(
        item => item.locale === resItem.locale && item.id === resItem.id,
      ) || resItem,
    )
    return { ...state, listWithLocales }
  },
  [UPDATE]: (state, {
    payload: {
      id, key, value, locale,
    },
  }) => {
    if (['content'].includes(key) && locale) {
      return updateIn(
        state,
        'listWithLocales',
        list => _.map(list, (template) => {
          if (template.id !== id || template.locale !== locale) { return template }
          return { ...template, [key]: value }
        }),
      )
    }
    return updateIn(
      state,
      'list',
      list => _.map(list, (instructionTemplate) => {
        if (instructionTemplate.id !== id) { return instructionTemplate }
        return { ...instructionTemplate, [key]: value }
      }),
    )
  },
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
