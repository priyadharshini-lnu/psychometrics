import { FC, useEffect, useRef } from 'react'
import { useApp } from '@thetalententerprise/glint'
import { formatedDate } from '~/utils/time'
import { useCurrentUserDetails } from './AdminTheme'
import { consumeBootNotice } from './bootNotices'
import type { SignInNoticeKind } from './currentUserDetails'

const { I18n } = window

const TIME_KEYS: Record<SignInNoticeKind, string> = {
  last_sign_in: 'devise.sessions.signed_in_time',
  last_unsuccessful: 'devise.sessions.unsuccessful_sign_in_time',
}

/**
 * The shell's only channel for one-shot server messages, replacing the flash Rails no longer renders.
 * A boot notice wins over the sign-in notice so invitation and password flows toast once, not twice.
 */
export const SignInNotice: FC = () => {
  const { message } = useApp()
  const details = useCurrentUserDetails()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const boot = consumeBootNotice()
    if (boot) {
      message[boot.type](I18n.t(boot.i18nKey))
      return
    }

    const notice = details?.signInNotice
    if (!notice) return

    message.info([
      I18n.t('devise.sessions.signed_in'),
      I18n.t(TIME_KEYS[notice.kind], { date_time: formatedDate(notice.at) }),
    ].join('  '))
  }, [details, message])

  return null
}

export default SignInNotice
