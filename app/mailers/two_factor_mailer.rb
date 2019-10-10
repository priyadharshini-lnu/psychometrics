# frozen_string_literal: true

class TwoFactorMailer < ApplicationMailer
  default from: "#{I18n.t('mailer.from')} <no-reply@#{Settings.domain}>"

  def two_factor_code_email(user, code)
    @user = user
    @code = code

    mail(
      to: @user.email,
      subject: I18n.t('devise.two_factor_authentication.email.otp.subject'),
      template_path: '/mailer/two_factor'
    )
  end
end
