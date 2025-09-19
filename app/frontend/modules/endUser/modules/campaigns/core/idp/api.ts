import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '~/core/rtkApi'
import {
  UpdateReflectionQuestionsResponse, SkillResponse,
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
    toggleSkillPrivacy: builder.mutation<SkillResponse, {
      userIdpSkillId: number,
    }>({
      query: ({ userIdpSkillId }) => ({
        url: `/user_idp_skills/${userIdpSkillId}/toggle_privacy`,
        method: 'PUT',
      }),
    }),
  }),
})

export const {
  useUpdateReflectionQuestionsMutation, useToggleSkillPrivacyMutation,
} = idpApi
