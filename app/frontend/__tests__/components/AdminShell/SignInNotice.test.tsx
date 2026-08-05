import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CurrentUserDetails, SignInNoticeKind } from '~/components/AdminShell/currentUserDetails'

type Mocks = {
  message: { info: ReturnType<typeof vi.fn>, error: ReturnType<typeof vi.fn>, success: ReturnType<typeof vi.fn> }
  session: { details: CurrentUserDetails | null }
}

const mocks = vi.hoisted<Mocks>(() => ({
  message: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
  session: { details: null },
}))

vi.mock('@thetalententerprise/glint', () => ({ useApp: () => ({ message: mocks.message }) }))
vi.mock('~/components/AdminShell/AdminTheme', () => ({ useCurrentUserDetails: () => mocks.session.details }))

import { SignInNotice } from '~/components/AdminShell/SignInNotice'

const detailsWith = (kind: SignInNoticeKind): CurrentUserDetails => ({
  id: '1',
  name: 'Ada',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  roleTitle: 'Superadmin',
  preferences: [],
  signInNotice: { kind, at: '2026-07-30T09:15:00Z' },
})

describe('SignInNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.session.details = null
    window.history.replaceState({}, '', '/admin')
    vi.spyOn(window.I18n, 't').mockImplementation((key: string) => key)
  })

  it('toasts the last sign-in once', () => {
    mocks.session.details = detailsWith('last_sign_in')

    const { rerender } = render(<SignInNotice />)
    rerender(<SignInNotice />)

    expect(mocks.message.info).toHaveBeenCalledTimes(1)
    expect(mocks.message.info).toHaveBeenCalledWith('devise.sessions.signed_in  devise.sessions.signed_in_time')
  })

  it('toasts the unsuccessful attempt instead when that is the kind', () => {
    mocks.session.details = detailsWith('last_unsuccessful')

    render(<SignInNotice />)

    expect(mocks.message.info).toHaveBeenCalledWith(
      'devise.sessions.signed_in  devise.sessions.unsuccessful_sign_in_time',
    )
  })

  it('says nothing without a notice', () => {
    mocks.session.details = { ...detailsWith('last_sign_in'), signInNotice: null }

    render(<SignInNotice />)

    expect(mocks.message.info).not.toHaveBeenCalled()
  })

  it('lets a boot notice win over the sign-in notice', () => {
    mocks.session.details = detailsWith('last_sign_in')
    window.history.replaceState({}, '', '/admin?notice=password_updated')

    render(<SignInNotice />)

    expect(mocks.message.success).toHaveBeenCalledWith('devise.password_expired.updated')
    expect(mocks.message.info).not.toHaveBeenCalled()
    expect(window.location.search).toEqual('')
  })
})
