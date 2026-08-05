export type BootNotice = {
  type: 'error' | 'success'
  i18nKey: string
}

// A closed allow-list: server redirects that land on the shell say why via ?notice=, never via flash.
const BOOT_NOTICES: Record<string, BootNotice> = {
  handoff_failed: { type: 'error', i18nKey: 'admin.handoff_invalid_token' },
  no_client_access_root: { type: 'error', i18nKey: 'admin.no_client_access_root' },
  feature_unavailable: { type: 'error', i18nKey: 'admin.feature_not_available' },
  password_updated: { type: 'success', i18nKey: 'devise.password_expired.updated' },
  csrf_retry: { type: 'error', i18nKey: 'errors.try_again' },
}

const stripNoticeParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('notice')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

/** Reads and removes the boot notice; unknown keys are dropped so a stray param can never toast. */
export const consumeBootNotice = (): BootNotice | null => {
  const key = new URL(window.location.href).searchParams.get('notice')
  if (key == null) return null

  stripNoticeParam()
  return BOOT_NOTICES[key] ?? null
}
