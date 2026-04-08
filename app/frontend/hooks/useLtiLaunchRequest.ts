import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { message } from 'antd'
import ApiAction from 'interfaces/ApiAction'
import * as t from 'io-ts'
import { snakeCase } from 'lodash'

const POST_LTI_LAUNCH_REQUEST = 'userAssessment/POST_LTI_LAUNCH_REQUEST'

const { I18n } = window

interface UseLtiLaunchRequestProps {
  url: string,
  onFailure?: (response: unknown) => void,
}

const LtiLaunchResponseTR = t.type({
  loginUrl: t.union([
    t.string,
    t.undefined,
  ]),
  params: t.union([
    t.record(t.string, t.unknown),
    t.undefined,
  ]),
  redirectUrl: t.union([
    t.string,
    t.undefined,
  ]),
  error: t.union([
    t.string,
    t.undefined,
  ]),
})

export type LtiLaunchResponse = t.TypeOf<typeof LtiLaunchResponseTR>

const useLtiLaunchRequest = ({
  url,
  onFailure,
}: UseLtiLaunchRequestProps) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const postLtiLaunchRequest = async (
    data: FormData | { [key: string]: unknown },
  ): Promise<ApiAction<LtiLaunchResponse>> => {
    const action = {
      type: POST_LTI_LAUNCH_REQUEST,
      request: {
        url,
        method: 'POST',
        body: data instanceof FormData ? data : {
          ...data,
        },
        contentType: (data instanceof FormData ? 'multipart/form-data;' as const : 'application/json' as const),
        typedResponse: LtiLaunchResponseTR,
      },
    }
    const response = dispatch(action)
    return response
  }

  const handleError = (error: unknown) => {
    setLoading(false)

    if (onFailure) {
      onFailure(error)
    } else {
      let errorMessage = I18n.t('common.errors.something_wrong')

      // Handle structured error responses
      if (typeof error === 'object' && error !== null && 'details' in error) {
        const errorObj = error as { details?: { message?: string } }
        if (errorObj.details?.message) {
          errorMessage = errorObj.details.message
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      console.error('LTI Launch Error:', error)
      message.error(errorMessage)
    }
  }

  const submitLtiForm = (loginUrl: string, params: { [key: string]: unknown }) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = loginUrl
    form.style.display = 'none'

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = snakeCase(key)
      input.value = String(value)
      form.appendChild(input)
    })

    const cleanup = () => {
      if (document.body.contains(form)) {
        document.body.removeChild(form)
      }
    }

    try {
      document.body.appendChild(form)
      form.submit()
    } finally {
      setTimeout(cleanup, 100)
    }
  }

  const makeLtiLaunchRequest = async (data: FormData | { [key: string]: unknown } = {}): Promise<void> => {
    setLoading(true)

    try {
      const { response } = await postLtiLaunchRequest(data)
      if (response.loginUrl && response.params) {
        submitLtiForm(response.loginUrl, response.params)
      } else if (response.redirectUrl) {
        window.location.href = response.redirectUrl
      } else if (response.error) {
        handleError(response.error)
      } else {
        handleError(I18n.t('common.errors.something_wrong'))
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    makeLtiLaunchRequest,
  }
}

export default useLtiLaunchRequest
