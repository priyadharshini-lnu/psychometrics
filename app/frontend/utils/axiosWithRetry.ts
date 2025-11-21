import axios from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { assign } from 'lodash'

const MAX_RETRIES = 5

export const axiosWithRetry = (config: IAxiosRetryConfig = {}) => {
  const defaults: IAxiosRetryConfig = {
    retries: MAX_RETRIES,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: axiosRetry.isRetryableError,
  }
  const axiosInstance = axios.create()
  const axiosRetryConfig = assign(defaults, config)
  axiosRetry(axiosInstance, axiosRetryConfig)
  return axiosInstance
}
