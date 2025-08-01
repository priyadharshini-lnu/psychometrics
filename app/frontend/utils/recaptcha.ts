export function fetchRecaptchaToken (siteKey: string, action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    function executeRecaptcha () {
      if (!window.grecaptcha || !window.grecaptcha.ready) {
        reject(new Error('reCAPTCHA not loaded'))
        return
      }
      window.grecaptcha.ready(() => {
        if (!window.grecaptcha.execute) {
          reject(new Error('reCAPTCHA execute not available'))
          return
        }
        window.grecaptcha.execute(siteKey, { action })
          .then(token => resolve(token))
          .catch(error => reject(error))
      })
    }

    if (!window.grecaptcha) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.onload = executeRecaptcha
      script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'))
      document.head.appendChild(script)
    } else {
      executeRecaptcha()
    }
  })
}
