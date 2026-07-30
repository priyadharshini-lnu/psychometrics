import { FC } from 'react'
import { connect } from 'react-redux'
import { LanguageSwitcher } from '@thetalententerprise/glint'
import { changeLocale } from '~/core/currentUser'

const { I18n } = window

type Props = {
  locales: string[]
  onChange: (locale: string) => unknown
}

/** glint's LanguageSwitcher on the admin's existing changeLocale action. */
const AdminLanguageSwitcherComponent: FC<Props> = ({ locales, onChange }) => {
  if (locales.length <= 1) return null

  const current = document.body.dataset.locale || I18n.locale

  return (
    <LanguageSwitcher
      languages={locales.map(locale => ({
        key: locale,
        label: <span lang={locale}>{I18n.t(`languages_localized.${locale}`)}</span>,
      }))}
      value={current}
      onChange={onChange}
      aria-label={I18n.t('frontend.aria.change_language')}
    />
  )
}

export const AdminLanguageSwitcher = connect(null, { onChange: changeLocale })(AdminLanguageSwitcherComponent)

export default AdminLanguageSwitcher
