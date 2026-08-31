import React, { useRef, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  AuthTemplate, Form, Button, Flex,
} from '@thetalententerprise/glint'
import type { AuthAlertItem } from '@thetalententerprise/glint'
import { RootState } from '../core/reducers'
import { TWO_FACTOR_PATH } from '../adminGlintRoutes'
import { buildAuthChrome } from './AuthChrome'
import { AuthField } from './AuthField'
import { useFlashToasts } from './useFlashToasts'

const { I18n } = window

const RESEND_PATH = `${TWO_FACTOR_PATH}/resend_code`

export type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux

const TwoFactorAuthPageComponent: React.FC<Props> = ({
  projectConfig, csrfToken, user, errors, flash,
}) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (submitting) {
      e.preventDefault()
      return
    }
    formRef.current = e.currentTarget
    setSubmitting(true)
  }

  useFlashToasts(flash)

  const alerts: AuthAlertItem[] = (errors.base || []).map((value): AuthAlertItem => ({ type: 'error', title: value }))

  const { brand, feature, footer } = buildAuthChrome(projectConfig)

  return (
    <AuthTemplate
      brand={brand}
      feature={feature}
      footer={footer}
      title={I18n.t('auth.otp.title')}
      subtitle={I18n.t('auth.otp.description')}
      alerts={alerts}
    >
      <form
        id="form-otp"
        action={TWO_FACTOR_PATH}
        method="post"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <input type="hidden" name="_method" value="put" />
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <input type="hidden" name="user[reset_password_token]" value={user.reset_password_token} />
        <Form component={false} layout="vertical">
          <AuthField
            id="otp-email"
            name="user[email]"
            label={I18n.t('auth.email')}
            type="email"
            placeholder={I18n.t('auth.email_placeholder')}
            defaultValue={user.email}
            autoComplete="email"
            disabled
          />
          <AuthField
            id="otp-code"
            name="code"
            label={I18n.t('auth.otp.code')}
            placeholder={I18n.t('auth.otp.code_placeholder')}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            error={errors.otp}
          />
          <Flex vertical gap="small">
            <Button color="primary" variant="solid" size="large" htmlType="submit" loading={submitting} block>
              {I18n.t('auth.otp.submit')}
            </Button>
            <Flex justify="center">
              <Button color="primary" variant="link" href={RESEND_PATH}>
                {I18n.t('auth.otp.resend')}
              </Button>
            </Flex>
            <Flex justify="center">
              <Button color="primary" variant="link" href="/administration/sign_out">
                {I18n.t('auth.sign_out')}
              </Button>
            </Flex>
          </Flex>
        </Form>
      </form>
    </AuthTemplate>
  )
}

const connector = connect((state: RootState) => state, {})

export const TwoFactorAuthPage = connector(TwoFactorAuthPageComponent)

export default TwoFactorAuthPage
