import {
  combineSlices, configureStore, createSlice,

} from '@reduxjs/toolkit'
import {
  createApi, fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'

interface Template {
  background?: string
  client_logo?: string
  logo_type?: string
  title_text?: string
  subtitle_text?: string
  fields: string[]
}

interface Skill {
  skill_type: string
  user_idp_development_actions: DevelopmentAction[]
}

interface DevelopmentAction {
  custom_action_learning_style?: string
  learning_style?: string
}

interface UserIdp {
  user_idp_skills: Skill[]
  reflection_questions: ReflectionQuestion[]
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
        params: { lang },
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

const store = configureStore({
  reducer: combineSlices({
    idp: idpReportSlice.reducer,
    [idpApi.reducerPath]: idpApi.reducer,
  }),
  preloadedState: __INITIAL_STATE__,
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
