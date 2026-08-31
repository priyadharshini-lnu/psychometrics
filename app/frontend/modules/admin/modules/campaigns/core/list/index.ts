import _ from 'lodash'
import { put, select, takeEvery } from 'redux-saga/effects'
import { AnyAction } from 'redux'
import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import { getTables } from '~/modules/admin/core/filterAndPagination/selectors'
import { createReducer } from '~/utils/redux'

const defaultState = []

type State = Campaign[]

export const get = (state): Campaign[] => _.get(state, ['campaigns', 'list'])

export const FETCH = 'campaigns/FETCH_CAMPAIGNS'
export const CREATE = 'resource/campaign/CREATE'
export const ADD_IN_REDUX_STORE = 'resource/campaign/ADD_IN_REDUX_STORE'
export const UPDATE = 'resource/campaign/UPDATE'
export const REMOVE = 'resource/campaign/REMOVE'
export const COPY = 'resource/campaign/COPY'
export const FETCH_TEMPLATES_AND_ASSESSMENTS = 'campaigns/FETCH_TEMPLATES_AND_ASSESSMENTS'
export const PDF_PASSWORD = 'campaigns/FETCH_PDF_PASSWORD'
export const FETCH_NAME_TRANSLATIONS = 'campaigns/FETCH_NAME_TRANSLATIONS'
export const EXPORT_CAMPAIGN_TRANSLATIONS = 'campaigns/EXPORT_CAMPAIGN_TRANSLATIONS'
export const IMPORT_CAMPAIGN_TRANSLATIONS = 'campaigns/IMPORT_CAMPAIGN_TRANSLATIONS'

export const fetch = (projectId: number, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    loader: true,
    url: `/administration/projects/${projectId}/new_campaigns`,
  },
})

export const fetchPdfPassword = (projectId, campaignId: number) : ApiAction<{ pdfPassword: string }> => ({
  type: PDF_PASSWORD,
  request: {
    method: 'get',
    loader: true,
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/pdf_password`,
  },
})

const CampaignNameWithLocaleTR = t.type({
  name: t.union([t.string, t.null]),
  locale: t.string,
})

const FetchNameTranslationsResponseTR = t.type({
  list: t.array(CampaignNameWithLocaleTR),
  availableLocales: t.array(t.string),
})

export type FetchNameTranslationsResponse = t.TypeOf<typeof FetchNameTranslationsResponseTR>

export const fetchNameTranslations = (
  projectId: number,
  campaignId: number,
  locales: Array<string | undefined>,
): ApiAction<FetchNameTranslationsResponse> => ({
  type: FETCH_NAME_TRANSLATIONS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/fetch_name_translations`,
    body: {
      locales: locales.filter(Boolean),
    },
    typedResponse: FetchNameTranslationsResponseTR,
  },
})

export const exportCampaignTranslations = (projectId: number) => ({
  type: EXPORT_CAMPAIGN_TRANSLATIONS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/new_campaigns/export_campaign_translations`,
  },
})

export const importCampaignTranslations = (projectId: number, data: FormData) => ({
  type: IMPORT_CAMPAIGN_TRANSLATIONS,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/new_campaigns/import_campaign_translations`,
    body: data,
    contentType: 'multipart/form-data;' as const,
  },
})

const CampaignTemplate = t.type({
  id: t.number,
  name: t.string,
  assessmentId: t.number,
  campaignId: t.union([t.null, t.number]),
  ownerId: t.union([t.null, t.number]),
  skillRater: t.boolean,
})
export type CampaignTemplate = t.TypeOf<typeof CampaignTemplate>

const Assessment = t.type({
  id: t.number,
  name: t.string,
  skillRater: t.boolean,
})
export type Assessment = t.TypeOf<typeof Assessment>

const TemplateAndAssessment = t.type({
  templates: t.array(CampaignTemplate),
  assessments: t.array(Assessment),
})
export type TemplateAndAssessment = t.TypeOf<typeof TemplateAndAssessment>

export const fetchTemplatesAndAssessments = (projectId): ApiAction<TemplateAndAssessment> => ({
  type: FETCH_TEMPLATES_AND_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/administration/projects/${projectId}/new_campaigns/templates_and_assessment`,
    typedResponse: TemplateAndAssessment,
  },
})

export const addInReduxStore = (data: Campaign) => ({
  type: ADD_IN_REDUX_STORE,
  payload: {
    data,
  },
})

export const copy = (campaignId: number, projectId: number, data) => ({
  type: REMOVE,
  request: {
    method: 'post',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/copy`,
    body: data,
  },
})

export const remove = (campaignId: number, projectId: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}`,
  },
})


type FetchType = ApiActionResponse<{campaigns: Campaign[]}>
type CreateType = ApiActionResponse<Campaign>
type UpdateType = CreateType
type AddType = ReturnType<typeof addInReduxStore>
type RemoveType = ApiActionResponse<number>

const HANDLERS = {
  [FETCH]: (_, { response }: FetchType) => response.campaigns,
  [CREATE]: (state: State, { response }: CreateType) => ([response, ...state]),
  [ADD_IN_REDUX_STORE]: (state: State, { payload }: AddType) => ([payload.data, ...state]),
  [UPDATE]: (state: State, { response }: UpdateType) => (
    _.map(state, (campaign: Campaign) => {
      if (campaign.id === response.id) { return response }

      return campaign
    })
  ),

  [REMOVE]: (state: State, { response }: RemoveType) => (
    state.filter(campaign => campaign.id !== response)
  ),
}

export default createReducer(HANDLERS, defaultState)

function* genFetchCampaigns ({ response }: AnyAction) {
  const tables = yield select(getTables)
  yield put(fetch(response.projectId, tables.campaignList))
}

export const watchers = [
  takeEvery(UPDATE, genFetchCampaigns),
]
