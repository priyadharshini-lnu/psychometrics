# frozen_string_literal: true

class TwoFactorMailer < ApplicationMailer
  default from: "#{I18n.t('mailer.from')} <no-reply@#{Settings.domain}>"

  def two_factor_code_email
    @user = params[:user]
    @code = params[:code]
    mail(
      to: @user.email,
      subject: I18n.t('two_factor.email.otp.subject'),
      template_path: '/mailer/two_factor'
    )
  end
end
