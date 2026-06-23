import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '~/core/rtkApi'
import {
  RequirementStatus, SystemCheckRecord, SystemCheckAddedRecord, SystemCheckResults,
} from './interfaces'

export const systemChecksAPI = createApi({
  reducerPath: 'systemChecksAPI',
  baseQuery: baseQuery(),
  tagTypes: ['SystemCheckSession'],
  endpoints: builder => ({
    addSystemCheckSession: builder.mutation<SystemCheckRecord, {
      campaignId: string,
    }>({
      query: ({ campaignId }) => ({
        url: `campaigns/${campaignId}/system_check_sessions`,
        method: 'POST',
      }),
      invalidatesTags: ['SystemCheckSession'],
    }),
    addSystemCheckRecord: builder.mutation<SystemCheckAddedRecord, {
      campaignId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      record: any,
    }>({
      query: ({ campaignId, record }) => ({
        url: `campaigns/${campaignId}/system_check_sessions/add_record`,
        method: 'POST',
        body: record,
      }),
    }),

    updateSystemCheckRecord: builder.mutation<SystemCheckAddedRecord, {
      campaignId: string,
      recordId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      record: any,
    }>({
      query: ({ campaignId, recordId, record }) => ({
        url: `campaigns/${campaignId}/system_check_records/${recordId}`,
        method: 'PATCH',
        body: record,
      }),
    }),

    completeSystemCheckSession: builder.mutation<SystemCheckRecord, {
      campaignId: string,
    }>({
      query: ({ campaignId }) => ({
        url: `campaigns/${campaignId}/system_check_sessions/complete`,
        method: 'POST',
      }),
    }),
    fetchSystemCheckResults: builder.query<SystemCheckResults, {
      campaignId: string,
    }>({
      query: ({ campaignId }) => ({
        url: `campaigns/${campaignId}/system_check_sessions/results`,
        method: 'GET',
      }),
    }),

    fetchSystemCheckRequirementsStatus: builder.query<RequirementStatus, {
      campaignId: string,
    }>({
      query: ({ campaignId }) => ({
        url: `campaigns/${campaignId}/system_check_sessions/requirements_status`,
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
      forceRefetch: () => true,
    }),
  }),
})

export const {
  useAddSystemCheckSessionMutation,
  useAddSystemCheckRecordMutation,
  useUpdateSystemCheckRecordMutation,
  useCompleteSystemCheckSessionMutation,
  useFetchSystemCheckResultsQuery,
  useFetchSystemCheckRequirementsStatusQuery,
} = systemChecksAPI
