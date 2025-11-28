import { message } from 'antd'
import axios from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { assign } from 'lodash'

const MAX_RETRIES = 5

const { I18n } = window

export const axiosWithRetry = (
  config: IAxiosRetryConfig = {}, retryMsg: string = I18n.t('enduser.request_retry_message'),
) => {
  const handleRetry: IAxiosRetryConfig['onRetry'] = (...args) => new Promise((resolve) => {
    const onRetryAttemptPromise = config.onRetry
      ? Promise.resolve(config.onRetry(...args))
      : Promise.resolve()
    if (!window.navigator.onLine) {
      message.destroy()
      message.warning(retryMsg, 10)
      window.addEventListener('online', () => {
        resolve(onRetryAttemptPromise)
      }, { once: true })
    } else {
      resolve(onRetryAttemptPromise)
    }
  })
  const defaults: IAxiosRetryConfig = {
    retries: MAX_RETRIES,
    retryDelay: (retryCount, error) => axiosRetry.exponentialDelay(retryCount, error, 600),
    retryCondition: axiosRetry.isRetryableError,
    onRetry: handleRetry,
  }
  const axiosInstance = axios.create()
  const axiosRetryConfig = assign(defaults, config)
  axiosRetry(axiosInstance, axiosRetryConfig)
  return axiosInstance
}
