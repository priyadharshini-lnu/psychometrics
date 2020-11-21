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
    retry: 5,
    retryDelay: 2000,
    backoffType: 'exponential',
    shouldRetry: (err: AxiosError) => {
      const cfg = retryAxios.getConfig(err)
      if (cfg && cfg.currentRetryAttempt && cfg.retry && cfg.currentRetryAttempt >= cfg.retry) {
        return false
      }
      return true
    },
  }
  const raxConfig: retryAxios.RetryConfig = assign(defaults, config, { onRetryAttempt, instance })
  instance.defaults.raxConfig = raxConfig
  retryAxios.attach(instance)
  return instance
}
