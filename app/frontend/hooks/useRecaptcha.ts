import { FormInstance } from 'antd'
import { useEffect, useState, useRef } from 'react'
import { loadRecaptchaScript, renderRecaptchaWidget } from '~/utils/recaptcha'

const { recaptchaSiteKey } = window.PsyGlobalState

type UseRecaptchaOptions ={
  formRef?: React.RefObject<HTMLFormElement>
  formInstance?: FormInstance
  disable_recaptcha?: boolean
}


export const useRecaptcha = ({ formRef, formInstance, disable_recaptcha }: UseRecaptchaOptions) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string>('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const recaptchaWidgetId = useRef<number | null>(null)


  useEffect(() => {
    if (disable_recaptcha) return
    loadRecaptchaScript(() => setRecaptchaReady(true))
  }, [])

  useEffect(() => {
    if (disable_recaptcha || !recaptchaReady) return

    window.grecaptcha.ready(() => {
      recaptchaWidgetId.current = renderRecaptchaWidget({
        sitekey: recaptchaSiteKey,
        callback: (token: string) => {
          if (formInstance) {
            formInstance.setFieldsValue({ recaptcha_token: token })
            formInstance.submit()
          } else if (formRef && formRef.current) {
            const input = formRef.current.querySelector('input[name="recaptcha_token"]') as HTMLInputElement
            if (input) input.value = token
            formRef.current.submit()
          }
          setRecaptchaToken(token)
        },
      })
    })
  }, [recaptchaReady, disable_recaptcha, formRef, formInstance])

  return {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  }
}
