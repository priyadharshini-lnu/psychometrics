import * as retryAxios from 'retry-axios'
import axios, { AxiosError, AxiosInstance } from 'axios'
import { assign } from 'lodash'

export const axiosWithRetry = (config: retryAxios.RetryConfig = {}): AxiosInstance => {
  const onRetryAttempt = (err: AxiosError) => new Promise((resolve) => {
    const onRetryAttemptPromise = config.onRetryAttempt
      ? Promise.resolve(config.onRetryAttempt(err))
      : Promise.resolve()
    if (!window.navigator.onLine) {
      window.addEventListener('online', () => {
        resolve(onRetryAttemptPromise)
      }, { once: true })
    } else {
      resolve(onRetryAttemptPromise)
    }
  })
  const instance = axios.create()
  const defaults = {
    retry: 3,
    retryDelay: 1000,
    backoffType: 'exponential',
  }
  const raxConfig: retryAxios.RetryConfig = assign(defaults, config, { onRetryAttempt, instance })
  instance.defaults.raxConfig = raxConfig
  retryAxios.attach(instance)
  return instance
}
