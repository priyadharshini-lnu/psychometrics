import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { createReducer, Payload } from 'utils/redux'
import {
  CampaignOptions, DescriptionWithLocaleTR, DescriptionWithLocale, InstructionsWithLocale,
} from 'modules/admin/modules/campaigns/interfaces/Campaign'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'

export const FETCH = 'campaigns/campaignOptions/FETCH'
export const FETCH_INSTRUCTIONS = 'campaigns/campaignOptions/FETCH_INSTRUCTIONS'
export const UPDATE = 'campaigns/campaignOptions/UPDATE'
export const UPDATE_INSTRUCTIONS = 'campaigns/campaignOptions/UPDATE_INSTRUCTIONS'

const { I18n } = window

const Instruction = t.type({ instructions: t.union([t.string, t.null]), locale: t.string })
const InstructionList = t.array(Instruction)
const FetchInstructionsTR = t.type({
  list: InstructionList,
  availableLocales: t.array(t.string),
})

const defaultState = {} as CampaignOptions

export const get = (state): CampaignOptions => _.get(state, ['campaigns', 'campaignOptions'])

export const fetch = (projectId: number, campaignId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_campaign_options`,
    loader: true,
  },
})

export const fetchInstructions = (projectId: number, campaignId: number, locales) => ({
  type: FETCH_INSTRUCTIONS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_campaign_instructions`,
    body: { locales: locales.filter(l => l) },
    typedResponse: FetchInstructionsTR,
  },
})

export const update = (
  projectId: number, campaignId: number, body: Partial<CampaignOptions>, locale = 'en',
) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/update_campaign_options`,
    body: { resource: body, locale },
  },
})
export const updateInstructions = (instructions: string, locale: string) => ({
  type: UPDATE_INSTRUCTIONS,
  payload: {
    locale,
    instructions,
  },
})

type CampaignOptionResponse = ApiActionResponse<CampaignOptions>
type FetchInstructionsResponse = ApiActionResponse<{ list: InstructionsWithLocale[], availableLocales: string[]}>

const FetchDescriptionsTR = t.type({
  list: t.array(DescriptionWithLocaleTR),
  availableLocales: t.array(t.string),
})
type FetchDescriptionResponse = ApiActionResponse<{ list: DescriptionWithLocale[], availableLocales: string[]}>

export const FETCH_DESCRIPTIONS = 'campaigns/campaignOptions/FETCH_DESCRIPTIONS'
export const UPDATE_DESCRIPTIONS = 'campaigns/campaignOptions/UPDATE_DESCRIPTION'
export const fetchDescriptions = (projectId: number, campaignId: number, locales) => ({
  type: FETCH_DESCRIPTIONS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_descriptions`,
    body: { locales: locales.filter(l => l) },
    typedResponse: FetchDescriptionsTR,
  },
})

export const updateDescriptions = (descriptions: string, locale: string) => ({
  type: UPDATE_DESCRIPTIONS,
  payload: {
    locale,
    descriptions,
  },
})

const HANDLERS = {
  [FETCH]: (state: CampaignOptions, { response }: CampaignOptionResponse) => ({ ...state, ...response }),
  [FETCH_INSTRUCTIONS]: (state: CampaignOptions, { response }: FetchInstructionsResponse) => {
    const instructionsWithLocales = response.list.map(
      resItem => (state.instructionsWithLocales || []).find(item => item.locale === resItem.locale) || resItem,
    )
    return {
      ...state,
      instructionsWithLocales,
      availableInstructionLocales: _.uniq([I18n.defaultLocale, ...response.availableLocales]),
    }
  },
  [UPDATE]: (state: CampaignOptions, { response }: CampaignOptionResponse) => ({ ...state, ...response }),
  [UPDATE_INSTRUCTIONS]: (state: CampaignOptions,
    { payload }: Payload<{ locale: string, instructions: string}>) => updateIn(
    state,
    'instructionsWithLocales',
    instructions => instructions.map((instr) => {
      if (instr.locale !== payload.locale) { return instr }
      return { ...instr, instructions: payload.instructions }
    }),
  ),
  [FETCH_DESCRIPTIONS]: (state: CampaignOptions, { response }: FetchDescriptionResponse) => {
    const descriptionsWithLocales = response.list.map(
      resItem => (state.descriptionsWithLocales || []).find(item => item.locale === resItem.locale) || resItem,
    )
    return {
      ...state,
      descriptionsWithLocales,
      availableDescriptionLocales: _.uniq([I18n.defaultLocale, ...response.availableLocales]),
    }
  },
  [UPDATE_DESCRIPTIONS]: (state: CampaignOptions,
    { payload }: Payload<{ locale: string, descriptions: string}>) => updateIn(
    state,
    'descriptionsWithLocales',
    (descriptions: DescriptionWithLocale[]) => descriptions.map((description) => {
      if (description.locale !== payload.locale) { return description }
      return { ...description, description: payload.descriptions }
    }),
  ),
}

export default createReducer(HANDLERS, defaultState)
