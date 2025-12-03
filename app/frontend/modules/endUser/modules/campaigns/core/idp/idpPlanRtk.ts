import { Action, createSlice } from '@reduxjs/toolkit'
import { idpApi } from './api'
import { ReflectionQuestion } from './interfaces'
import { FETCH_USER_IDP_PLAN } from './userIdpPlan'

interface FetchResponse extends Action<typeof FETCH_USER_IDP_PLAN> {
  response: {
    data: {
      reflectionQuestions: ReflectionQuestion[]
    }
  }
}

interface UserIdpPlan {
  reflectionQuestions: ReflectionQuestion[]
}

const defaultState:UserIdpPlan = {
  reflectionQuestions: [],
}

const idp = createSlice({
  name: 'idp',
  initialState: defaultState,
  reducers: {
    setReflectiveQuestions (state, { payload }) {
      state.reflectionQuestions = payload.reflectionQuestions
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      FETCH_USER_IDP_PLAN, (state, action: FetchResponse) => {
        state.reflectionQuestions = action.response.data.reflectionQuestions
      },
    )
    builder.addMatcher(
      idpApi.endpoints.updateReflectionQuestions.matchFulfilled,
      (state, action) => {
        state.reflectionQuestions = action.payload.data
      },
    )
  },
})

export const getReflectiveQuestions = (
  state: {
  campaigns: { idpRtk: UserIdpPlan }
},
) => state.campaigns.idpRtk.reflectionQuestions

export const { actions } = idp

export default idp.reducer
