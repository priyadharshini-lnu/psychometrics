import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import * as t from 'io-ts'
import reminderRulesReducer from './reminderRules'

export const get = state => _.get(state, ['threeSixtyCampaign', 'emailTemplates'])

const defaultState = {
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


const Locale = t.type({
  content: t.string, locale: t.string, subject: t.string, id: t.number,
})
const LocaleList = t.array(Locale)
const FetchByLocalesTR = t.type({
  list: LocaleList,
  availableLocales: t.array(t.string),
})


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
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates`,
  },
})
export const fetchByLocales = (campaignId, id, locales) => ({
  type: FETCH_BY_LOCALES,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${id}`,
    body: { locales: locales.filter(l => l) },
    typedResponse: FetchByLocalesTR,
  },
})

export const save = (campaignId, emailTemplate, locale) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${emailTemplate.id}`,
    body: { emailTemplate, locale },
  },
})

export const sendTestEmail = (campaignId, id, toEmail) => ({
  type: SEND_TEST_EMAIL,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${id}/send_test_email`,
    body: { toEmail },
  },
})

const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
  [FETCH_BY_LOCALES]: (state, { response }) => {
    const listWithLocales = response.list.map(
      resItem => state.listWithLocales.find(
        item => item.locale === resItem.locale && item.id === resItem.id,
      ) || resItem,
    )
    return { ...state, listWithLocales, availableLocales: _.uniq([I18n.defaultLocale, ...response.availableLocales]) }
  },
  [UPDATE]: (state, {
    payload: {
      id, key, value, locale,
    },
  }) => {
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

export default function reducer (state = defaultState, action) {
  const index = _.findIndex(state.list, ({ id }) => id === _.get(action, ['payload', 'emailTemplateId']))
  const stateFromInnerReducer = updateIn(
    state, ['list', index, 'meta', 'reminderRules'], state => reminderRulesReducer(state, action),
  )

  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}
