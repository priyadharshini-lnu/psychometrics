import { FC, useEffect, useRef } from 'react'
import { useApp } from '@thetalententerprise/glint'
import { formatedDate } from '~/utils/time'
import { consumeBootNotice } from './bootNotices'
import { fetchCurrentUserDetails } from './currentUserDetails'
import type { SignInNoticeKind } from './currentUserDetails'

const { I18n } = window

const TIME_KEYS: Record<SignInNoticeKind, string> = {
  last_sign_in: 'devise.sessions.signed_in_time',
  last_unsuccessful: 'devise.sessions.unsuccessful_sign_in_time',
}

// A failed attempt on the account is a caution, not something to congratulate.
const NOTICE_TYPES: Record<SignInNoticeKind, 'success' | 'warning'> = {
  last_sign_in: 'success',
  last_unsuccessful: 'warning',
}

// Seconds. antd's 3s default reads as a flash for a message that lands while the shell is still painting.
export const NOTICE_DURATION = 15

/**
 * The shell's only channel for one-shot server messages, replacing the flash Rails no longer renders.
 * A boot notice wins over the sign-in notice so invitation and password flows toast once, not twice.
 */
export const SignInNotice: FC = () => {
  const { message } = useApp()
  const fired = useRef(false)

  // Server-side one-shot: consuming it deletes the session key, so only the API may deliver it — after paint.
  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const boot = consumeBootNotice()
    if (boot) {
      message[boot.type](I18n.t(boot.i18nKey), NOTICE_DURATION)
      return
    }

    fetchCurrentUserDetails().then((details) => {
      const notice = details?.signInNotice
      if (!notice) return

      message[NOTICE_TYPES[notice.kind]]([
        I18n.t('devise.sessions.signed_in'),
        I18n.t(TIME_KEYS[notice.kind], { date_time: formatedDate(notice.at) }),
      ].join('  '), NOTICE_DURATION)
    })
  }, [message])

  return null
}

export default SignInNotice
