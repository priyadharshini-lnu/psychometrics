import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { createReducer, Payload } from 'utils/redux'
import { CampaignOptions, InstructionsWithLocale } from 'modules/admin/modules/campaigns/interfaces/Campaign'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'

export const FETCH = 'campaigns/campaignOptions/FETCH'
export const FETCH_INSTRUCTIONS = 'campaigns/campaignOptions/FETCH_INSTRUCTIONS'
export const UPDATE = 'campaigns/campaignOptions/UPDATE'
export const UPDATE_INSTRUCTIONS = 'campaigns/campaignOptions/UPDATE_INSTRUCTIONS'


const Instruction = t.type({ instructions: t.string, locale: t.string })
const InstructionList = t.array(Instruction)

const defaultState = {} as CampaignOptions

export const get = (state): CampaignOptions => _.get(state, ['campaigns', 'campaignOptions'])

export const fetch = (projectId: number, campaignId: number) => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_campaign_options`,
  },
})

export const fetchInstructions = (projectId: number, campaignId: number, locales) => ({
  type: FETCH_INSTRUCTIONS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_campaign_instructions`,
    body: { locales: locales.filter(l => l) },
    typedResponse: InstructionList,
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
type FetchInstructionsResponse = ApiActionResponse<InstructionsWithLocale[]>


const HANDLERS = {
  [FETCH]: (state: CampaignOptions, { response }: CampaignOptionResponse) => ({ ...state, ...response }),
  [FETCH_INSTRUCTIONS]: (state: CampaignOptions, { response }: FetchInstructionsResponse) => {
    const instructionsWithLocales = response.map(
      resItem => (state.instructionsWithLocales || []).find(item => item.locale === resItem.locale) || resItem,
    )
    return { ...state, instructionsWithLocales }
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
}

export default createReducer(HANDLERS, defaultState)
