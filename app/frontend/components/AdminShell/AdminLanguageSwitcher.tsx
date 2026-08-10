import { FC } from 'react'
import { LanguageSwitcher } from '@thetalententerprise/glint'
import { useAdminLocales } from './adminLocales'

const { I18n } = window

type Props = {
  locales: string[]
}

/** glint's LanguageSwitcher on the shared locale behaviour; the profile menu offers the same list. */
export const AdminLanguageSwitcher: FC<Props> = ({ locales }) => {
  const { options, current, change } = useAdminLocales(locales)

  if (!options.length) return null

  return (
    <LanguageSwitcher
      languages={options}
      value={current}
      onChange={change}
      variant="text"
      aria-label={I18n.t('frontend.aria.change_language')}
    />
  )
}
