import _ from 'lodash'
import * as t from 'io-ts'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'

const { I18n } = window

export const get = state => _.get(state, ['threeSixtyCampaign', 'instructionTemplates'])
interface State {
  list: Locale[],
  listWithLocales: Locale[],
  availableLocales: string[],
}

interface Template {
  id: number
  name: string
  content: string
  disabled: boolean
}

interface TemplateLocale {
  id: number
  locale: string
  content: string
}

const defaultState: State = {
  list: [],
  listWithLocales: [],
  availableLocales: [],
}

export const FETCH = 'threeSixty/instructionTemplates/FETCH'
export const UPDATE = 'threeSixty/instructionTemplates/UPDATE'
export const SAVE = 'threeSixty/instructionTemplates/SAVE'
export const FETCH_BY_LOCALES = 'threeSixty/instructionTemplates/FETCH_BY_LOCALES'

const LocaleTR = t.type({
  content: t.string, locale: t.string, id: t.number,
})
const LocaleList = t.array(LocaleTR)
const FetchByLocalesTR = t.type({
  list: LocaleList,
  availableLocales: t.array(t.string),
})
type Locale = t.TypeOf<typeof LocaleTR>

export const update = (id: number, key: string, value, locale: Locale) => ({
  type: UPDATE,
  payload: {
    id, key, value, locale,
  },
})

export const fetch = (campaignId: number) => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates`,
    loader: true,
  },
})

export const fetchByLocales = (campaignId: number, id: number, locales: Locale[]) => ({
  type: FETCH_BY_LOCALES,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates/${id}`,
    body: { locales: locales.filter(l => l) },
    typedResponse: FetchByLocalesTR,
  },
})

export const save = (campaignId: number, instructionTemplate: Template, locale: Locale) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/instruction_templates/${instructionTemplate.id}`,
    body: { instructionTemplate, locale },
  },
})

interface FetchResponse {
  list: TemplateLocale[]
  availableLocales: string[]
}

type FetchType = ApiActionResponse<Locale[]>
type FetchByLocalesType = ApiActionResponse<FetchResponse>
type UpdateType = ReturnType<typeof update>

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchType) => ({ ...state, list: response }),
  [FETCH_BY_LOCALES]: (state: State, { response }: FetchByLocalesType) => {
    const listWithLocales = response.list.map(
      resItem => state.listWithLocales.find(
        item => item.locale === resItem.locale && item.id === resItem.id,
      ) || resItem,
    )
    return { ...state, listWithLocales, availableLocales: _.uniq([I18n.defaultLocale, ...response.availableLocales]) }
  },
  [UPDATE]: (state: State, {
    payload: {
      id, key, value, locale,
    },
  }: UpdateType) => {
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
export default createReducer(HANDLERS, defaultState)
