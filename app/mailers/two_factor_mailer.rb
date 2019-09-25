class TwoFactorMailer < ApplicationMailer
  default from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>"

  def two_factor_code_email
    @user = params[:user]
    mail(
      to: @user.email,
      subject: "#{t('two_factor.email.otp.subject')}"
    )
  end
end
