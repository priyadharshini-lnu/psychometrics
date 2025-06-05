import humps from 'humps'
import { BaseQueryApi, FetchArgs, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type QueryReturnValue<T = unknown, E = unknown, M = unknown> = {
  error: E;
  data?: undefined;
  meta?: M;
} | {
  error?: undefined;
  data: T;
  meta?: M;
};

export const baseQuery = ({ baseUrl = '/', camelize = true, decamelize = true } = {}) => {
  const bQ = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      const csrfToken = window.$('meta[name="csrf-token"]').attr('content')
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken)
      }
      return headers
    },
  })

  return async (params: FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
    const result = await bQ(
      { ...params, body: decamelize ? humps.decamelizeKeys(params.body) : params.body },
      api,
      extraOptions,
    )

    if (result.data && camelize) {
      return { ...result, data: humps.camelizeKeys(result.data) } as QueryReturnValue<unknown, unknown, {}>
    }
    return result
  }
}
