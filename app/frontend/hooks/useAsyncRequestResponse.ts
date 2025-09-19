import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { message } from 'antd'
import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'
import { useLocalStorage } from './useLocalStorage'

const POST_QUEUE_REQUEST = 'userAssessment/POST_QUEUE_REQUEST'
const QUERY_QUEUE_STATUS = 'userAssessment/QUERY_QUEUE_STATUS'

const { I18n } = window

interface UseAsyncRequestResponseProps<T> {
  url: string,
  data: { [key: string]: unknown },
  responseType: t.Type<T>,
  numberOfTimesToPoll?: number,
  pollingInterval?: number,
  onFailure?: (response: any) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
}

const PostToQueueResponseTR = t.type({
  asyncRequestUuid: t.union([
    t.string,
    t.undefined,
  ]),
  responseData: t.union([
    t.string,
    t.type({}),
    t.undefined,
  ]),
})

export type PostToQueueResponse = t.TypeOf<typeof PostToQueueResponseTR>

const useAsyncRequestResponse = <T>({
  url,
  data,
  responseType,
  numberOfTimesToPoll = 20,
  pollingInterval = 5,
  onFailure,
}: UseAsyncRequestResponseProps<T>) => {
  const dispatch = useDispatch()
  const [asyncLoading, setAsyncLoading] = useState(false)
  const attemptRef = useRef(1)
  const intervalIdRef: React.MutableRefObject<NodeJS.Timeout> = useRef(setTimeout(() => {}, 0))

  const [storedRequest, saveAsyncRequest, removeRequest] = useLocalStorage(`async/${url}`, null)

  const postQueueRequest = async (
    data: FormData | { [key: string]: unknown },
  ): Promise<ApiAction<PostToQueueResponse>> => {
    const action = {
      type: POST_QUEUE_REQUEST,
      request: {
        url,
        method: 'POST',
        body: data instanceof FormData ? data : {
          ...data,
        },
        contentType: (data instanceof FormData ? 'multipart/form-data;' as const : 'application/json' as const),
        typedResponse: PostToQueueResponseTR,
      },
    }
    const response = dispatch(action)
    return response
  }

  const handleError = (error: string) => {
    clearTimeout(intervalIdRef.current)
    setAsyncLoading(false)

    if (onFailure) {
      onFailure(error)
    } else {
      const errorMessage = error || I18n.t('common.errors.something_wrong')
      message.error(errorMessage)
    }
  }

  const queryQueueStatus = async (asyncRequestUuid: string): Promise<ApiAction<T>> => {
    const action = {
      type: QUERY_QUEUE_STATUS,
      request: {
        url: `/async_requests/status?async_request_uuid=${asyncRequestUuid}`,
        method: 'GET',
        typedResponse: responseType,
      },
    }
    const response = dispatch(action)
    return response
  }

  const startPollingForStatus = async (asyncRequestUuid: string) => {
    try {
      const { response: { status, response } } = await queryQueueStatus(asyncRequestUuid)

      if (status === 'completed') {
        if (response.responseType === 'redirect') {
          const redirectUrl = response.responseData

          location.href = redirectUrl
        } else {
          setAsyncLoading(false)
        }

        removeRequest()
        clearTimeout(intervalIdRef.current)
        setAsyncLoading(false)
        return response
      }

      if (status === 'failed' || status === 'request_not_found' || (attemptRef.current >= numberOfTimesToPoll)) {
        if (onFailure) {
          removeRequest()
          onFailure(response)
          clearTimeout(intervalIdRef.current)
          setAsyncLoading(false)
        } else {
          handleError(response.responseData?.error)
        }
        return null
      }

      attemptRef.current += 1
    } catch (error) {
      handleError(error)
      return null
    }
  }

  const makeAsyncRequest = (extraData: FormData | {} = {}): Promise<ApiAction<T>> => {
    setAsyncLoading(true)
    return new Promise(async (resolve, reject) => {
      try {
        const { response } = await postQueueRequest(
          extraData instanceof FormData ? extraData : { ...data, ...extraData },
        )

        const { asyncRequestUuid } = response
        saveAsyncRequest(asyncRequestUuid)


        if (asyncRequestUuid === undefined) {
          setAsyncLoading(false)
          resolve(response)
          return response
        }

        intervalIdRef.current = setInterval(() => {
          startPollingForStatus(asyncRequestUuid)
            .then((pollingResult) => {
              if (pollingResult) {
                clearInterval(intervalIdRef.current)
                resolve(pollingResult)
              }
            })
            .catch((error) => {
              handleError(error)
              reject(error)
            })
        }, pollingInterval * 1000)
      } catch (error) {
        handleError(error)
      }
    })
  }

  useEffect(() => () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
    }
  }, [])

  const startPolling = () => {
    if (storedRequest) {
      return startPollingForStatus(storedRequest)
    }
    return null
  }

  return {
    asyncLoading, makeAsyncRequest, startPolling,
  }
}

export default useAsyncRequestResponse
