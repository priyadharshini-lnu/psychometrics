import { describe, expect, it } from 'vitest'
import { consumeBootNotice } from '~/components/AdminShell/bootNotices'

const visit = (search: string) => window.history.replaceState({}, '', `/admin${search}`)

describe('consumeBootNotice', () => {
  it.each([
    ['handoff_failed', 'error', 'admin.handoff_invalid_token'],
    ['no_client_access_root', 'error', 'admin.no_client_access_root'],
    ['feature_unavailable', 'error', 'admin.feature_not_available'],
    ['password_updated', 'success', 'devise.password_expired.updated'],
    ['csrf_retry', 'error', 'errors.try_again'],
  ])('maps ?notice=%s', (key, type, i18nKey) => {
    visit(`?notice=${key}`)

    expect(consumeBootNotice()).toEqual({ type, i18nKey })
  })

  it('strips the param so a reload cannot toast twice', () => {
    visit('?notice=handoff_failed&client_id=7')

    consumeBootNotice()

    expect(window.location.search).toEqual('?client_id=7')
    expect(consumeBootNotice()).toBeNull()
  })

  it('drops a key outside the allow-list', () => {
    visit('?notice=whatever')

    expect(consumeBootNotice()).toBeNull()
    expect(window.location.search).toEqual('')
  })

  it('returns nothing when the param is absent', () => {
    visit('')

    expect(consumeBootNotice()).toBeNull()
  })
})
