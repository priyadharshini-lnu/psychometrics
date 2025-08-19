import { useEffect, useState, useRef } from 'react'
import { loadRecaptchaScript, renderRecaptchaWidget } from '~/utils/recaptcha'

const { recaptchaSiteKey } = window.PsyGlobalState

export const useRecaptcha = (formRef: React.RefObject<HTMLFormElement>, disable_recaptcha) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string>('')
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const recaptchaWidgetId = useRef<number | null>(null)
  const renderedForm = useRef<HTMLFormElement | null>(null)


  useEffect(() => {
    if (disable_recaptcha) return
    loadRecaptchaScript(() => setRecaptchaReady(true))
  }, [])

  useEffect(() => {
    if (disable_recaptcha || !recaptchaReady) return
    const formElement = formRef.current
    if (!formElement || renderedForm.current === formElement) return

    window.grecaptcha.ready(() => {
      recaptchaWidgetId.current = renderRecaptchaWidget({
        sitekey: recaptchaSiteKey,
        callback: (token: string) => {
          const input = formRef.current?.querySelector('input[name="recaptcha_token"]') as HTMLInputElement
          if (input) input.value = token
          setRecaptchaToken(token)
          formElement.submit()
        },
      })
      renderedForm.current = formElement
    })
  }, [recaptchaReady, disable_recaptcha, formRef.current])

  return {
    recaptchaToken,
    recaptchaReady,
    recaptchaWidgetId,
  }
}
