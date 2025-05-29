import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '~/core/rtkApi'
import {
  UpdateReflectionQuestionsResponse,
} from './interfaces'

export const idpApi = createApi({
  reducerPath: 'idpApi',
  baseQuery: baseQuery(),
  tagTypes: ['IdpPlanReflectionQuestions'],
  endpoints: builder => ({
    updateReflectionQuestions: builder.mutation<UpdateReflectionQuestionsResponse, {
      userId: string,
      reflectionQuestions: Array<{
        id: string,
        answer: string
      }>
    }>({
      query: ({ userId, reflectionQuestions }) => ({
        url: `user_idp_plans/${userId}/update_reflection_questions`,
        method: 'PUT',
        body: {
          reflectionQuestions,
        },
      }),
      invalidatesTags: ['IdpPlanReflectionQuestions'],
    }),
  }),
})

export const {
  useUpdateReflectionQuestionsMutation,
} = idpApi
