import { useDispatch } from 'react-redux'
import type { ReactNode } from 'react'
import { useApp } from '@thetalententerprise/glint'
import { changeLocale } from '~/core/currentUser'
import { getLocalizedLanguageName } from '~/utils/locales'

const { I18n } = window

export interface AdminLocaleOption {
  key: string
  label: ReactNode
}

export interface AdminLocales {
  /** Empty when the feature is off or only one locale exists — callers render nothing. */
  options: AdminLocaleOption[]
  current: string
  change: (locale: string) => void
}

/**
 * The admin's locale list, current value and change behaviour — in one place, because two surfaces
 * now offer it: the standalone top-bar switcher and the profile menu's Language submenu. The
 * reload is the load-bearing part: server-rendered strings do not re-translate in place.
 */
export const useAdminLocales = (locales: string[]): AdminLocales => {
  const dispatch = useDispatch()
  const { message } = useApp()

  const change = (locale: string): void => {
    // Resolve()-wrapped so this works whether the action returns a promise or not, with no cast.
    Promise.resolve(dispatch(changeLocale(locale))).then(
      () => { location.reload() },
      () => { message.error(I18n.t('common.errors.something_wrong')) },
    )
  }

  return {
    options: locales.length > 1
      ? locales.map(locale => ({
        key: locale,
        label: <span lang={locale}>{getLocalizedLanguageName(locale)}</span>,
      }))
      : [],
    current: document.body.dataset.locale || I18n.locale,
    change,
  }
}
