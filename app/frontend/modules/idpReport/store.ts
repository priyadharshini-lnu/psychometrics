import {
  combineSlices, configureStore, createSlice,

} from '@reduxjs/toolkit'
import {
  createApi, fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'
import humps from 'humps'

interface FontStyle {
  fontFamily?: string
  fontSize?: string
  fontColor?: string
}

interface PageStyle {
  title?: FontStyle
  subtitle?: FontStyle
  body?: FontStyle
  sectionTitle?: FontStyle
  sectionSubtitle?: FontStyle
  sectionBody?: FontStyle
}

export interface PageStyles {
  cover?: PageStyle
  guidelines?: PageStyle
  report_summary?: PageStyle
  idp?: PageStyle
  reflections?: PageStyle
  last?: PageStyle
}

export interface Template {
  background?: string
  client_logo?: string
  logo_type?: string
  title_text?: string
  subtitle_text?: string
  fields: string[]
  guideline_position?: string
  flip_background?: boolean
  show_guidelines?: boolean
  page_styles?: PageStyles
}

interface Skill {
  skill_type: string
  user_idp_development_actions: DevelopmentAction[]
}

interface DevelopmentAction {
  custom_action_learning_style?: string
  learning_style?: string
}

export interface UserIdp {
  user_idp_skills: Skill[]
  reflection_questions: ReflectionQuestion[]
  status: string
  start_date: string
  assigned_date: string
  end_date: string
  completed_date: string
}

interface IdpReportState {
  template: Template
  userIdp: UserIdp
}
interface ReflectionQuestion {
  id: string
  question: string | null
  mandatory: boolean
  min_words: number | null
  max_words: number | null
  answer?: string
}

interface IdpReportResponse {
  template: Template
  user_idp: UserIdp
}

const initialState: IdpReportState = {
  template: {
    fields: [],
  },
  userIdp: {
    user_idp_skills: [],
    reflection_questions: [],
    status: '',
    start_date: '',
    assigned_date: '',
    end_date: '',
    completed_date: '',
  },
}

interface TemplateParams {
  lang: string;
  campaignId: string;
  id: string;
}

export const idpApi = createApi({
  reducerPath: 'idpApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json')
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  endpoints: builder => ({
    getTemplateInfo: builder.query<IdpReportResponse, TemplateParams>({
      query: ({
        lang, campaignId, id,
      }) => ({
        url: `administration/new_campaigns/${campaignId}/user_idp_reports/${id}.json`,
        params: { report_lang: lang },
      }),
      transformResponse: (response: IdpReportResponse) => ({
        ...response,
        template: {
          ...response.template,
          page_styles: response.template.page_styles
            ? humps.camelizeKeys(response.template.page_styles) as PageStyles
            : undefined,
        },
      }),
    }),
  }),
})

const idpReportSlice = createSlice({
  name: 'idp',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        idpApi.endpoints.getTemplateInfo.matchFulfilled,
        (state, action) => {
          state.template = action.payload.template
          state.userIdp = action.payload.user_idp
        },
      )
  },
})

const { __INITIAL_STATE__, __DEV__ } = window

const camelizePageStyles = (state: typeof __INITIAL_STATE__) => {
  if (!state?.idp?.template?.page_styles) return state
  return {
    ...state,
    idp: {
      ...state.idp,
      template: {
        ...state.idp.template,
        page_styles: humps.camelizeKeys(state.idp.template.page_styles) as PageStyles,
      },
    },
  }
}

const store = configureStore({
  reducer: combineSlices({
    idp: idpReportSlice.reducer,
    [idpApi.reducerPath]: idpApi.reducer,
  }),
  preloadedState: camelizePageStyles(__INITIAL_STATE__),
  devTools: __DEV__,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,
  }).concat(idpApi.middleware),
})

export const { useGetTemplateInfoQuery } = idpApi

export type RootState = ReturnType<typeof store.getState>
export type AppState = {idp: IdpReportState}
export type AppDispatch = typeof store.dispatch

export default store
