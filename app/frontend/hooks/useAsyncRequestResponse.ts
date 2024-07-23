import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { message } from 'antd'
import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'

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

  const postQueueRequest = async (
    data: { [key: string]: unknown },
  ): Promise<ApiAction<PostToQueueResponse>> => {
    const action = {
      type: POST_QUEUE_REQUEST,
      request: {
        url,
        method: 'POST',
        body: {
          ...data,
        },
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

        clearTimeout(intervalIdRef.current)
        return response
      }

      if (status === 'failed' || status === 'request_not_found' || (attemptRef.current >= numberOfTimesToPoll)) {
        if (onFailure) {
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

  const makeAsyncRequest = (): Promise<ApiAction<T>> => {
    setAsyncLoading(true)
    return new Promise(async (resolve, reject) => {
      try {
        const { response } = await postQueueRequest(data)
        const { asyncRequestUuid } = response

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

  return {
    asyncLoading, makeAsyncRequest,
  }
}

export default useAsyncRequestResponse
