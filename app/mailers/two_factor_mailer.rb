# frozen_string_literal: true

class TwoFactorMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email'

  default from: Branding.mail_from("no-reply@#{Settings.domain}")

  def two_factor_code_email(user, code)
    @user = user
    @code = code
    @resource = user

    send_email(
      @user,
      subject: I18n.t('devise.two_factor_authentication.email.otp.subject'),
      template_path: 'mailer/two_factor'
    )
  end
end
