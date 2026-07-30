import { FC, useState } from 'react'
import { connect } from 'react-redux'
import { LanguageSwitcher } from '@thetalententerprise/glint'
import { changeLocale } from '~/core/currentUser'

const { I18n } = window

type Props = {
  onChange: (locale: string) => Promise<unknown>
}

const LangControlComponent: FC<Props> = ({ onChange }) => {
  const locales: string[] = I18n.availableLocales || []
  const currentLocale = document.body.dataset.locale
    || I18n.currentLocale?.()
    || I18n.locale
  const [loading, setLoading] = useState(false)

  if (locales.length <= 1) return null

  const languages = locales.map(loc => ({
    key: loc,
    label: <span lang={loc}>{I18n.t(`languages_localized.${loc}`)}</span>,
  }))

  return (
    <LanguageSwitcher
      languages={languages}
      value={currentLocale}
      disabled={loading}
      onChange={(loc) => {
        setLoading(true)
        onChange(loc).then(() => location.reload())
      }}
    />
  )
}

export const LangControl = connect(null, { onChange: changeLocale })(LangControlComponent)

export default LangControl
