import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import * as t from 'io-ts'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import reminderRulesReducer from './reminderRules'

const { I18n } = window
export const get = state => _.get(state, ['threeSixtyCampaign', 'emailTemplates'])

interface State {
  list: Locale[],
  listWithLocales: Locale[],
  availableLocales: string[],
}

interface EmailTemplate {
  id: number
}

const defaultState: State = {
  list: [],
  listWithLocales: [],
  availableLocales: [],
}

export const FETCH = 'threeSixty/emailTemplates/FETCH'
export const UPDATE = 'threeSixty/emailTemplates/UPDATE'
export const SAVE = 'threeSixty/emailTemplates/SAVE'
export const CHANGE_SELECTED = 'threeSixty/emailTemplates/CHANGE_SELECTED'
export const SEND_TEST_EMAIL = 'threeSixty/emailTemplates/SEND_TEST_EMAIL'
export const FETCH_BY_LOCALES = 'threeSixty/emailTemplates/FETCH_BY_LOCALES'


const LocaleTR = t.type({
  content: t.union([t.string, t.null]), locale: t.string, subject: t.string, id: t.number,
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
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates`,
  },
})

export const fetchByLocales = (campaignId: number, id: number, locales: Locale[]) => ({
  type: FETCH_BY_LOCALES,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${id}`,
    body: { locales: locales.filter(l => l) },
    typedResponse: FetchByLocalesTR,
  },
})

export const save = (campaignId: number, emailTemplate: EmailTemplate, locale: Locale) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${emailTemplate.id}`,
    body: { emailTemplate, locale },
  },
})

export const sendTestEmail = (campaignId: number, id: number, toEmail: string) => ({
  type: SEND_TEST_EMAIL,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${id}/send_test_email`,
    body: { toEmail },
  },
})

type FetchByLocalesResponse = t.TypeOf<typeof FetchByLocalesTR>

export type FetchAction = ApiActionResponse<Locale[]>
export type FetchByLocalesAction = ApiActionResponse<FetchByLocalesResponse>
export type UpdateAction = ApiActionResponse<FetchByLocalesResponse>

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchAction) => ({ ...state, list: response }),
  [FETCH_BY_LOCALES]: (state: State, { response }: FetchByLocalesAction) => {
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
  }: UpdateAction) => {
    if (['subject', 'content'].includes(key)) {
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
      list => _.map(list, (emailTemplate) => {
        if (emailTemplate.id !== id) { return emailTemplate }
        return { ...emailTemplate, [key]: value }
      }),
    )
  },
}

export default createReducer(HANDLERS, defaultState, (state, action) => {
  const index = _.findIndex(state.list, ({ id }) => id === _.get(action, ['payload', 'emailTemplateId']))
  const stateFromInnerReducer = updateIn(
    state, ['list', index, 'meta', 'reminderRules'], state => reminderRulesReducer(state, action),
  )
  return stateFromInnerReducer
})
