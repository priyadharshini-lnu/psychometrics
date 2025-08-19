export function loadRecaptchaScript (callback?: () => void) {
  if (document.getElementById('recaptcha-script')) {
    if (callback) callback()
    return
  }
  const script = document.createElement('script')
  script.id = 'recaptcha-script'
  script.src = 'https://www.google.com/recaptcha/api.js'
  script.async = true
  script.onload = callback || null
  document.body.appendChild(script)
}

export function renderRecaptchaWidget ({
  sitekey,
  callback,
}: {
  sitekey: string
  callback: (token: string) => void
}) {
  if (!window.grecaptcha) return null
  return window.grecaptcha.render('recaptcha-button', {
    sitekey,
    size: 'invisible',
    callback,
  })
}
