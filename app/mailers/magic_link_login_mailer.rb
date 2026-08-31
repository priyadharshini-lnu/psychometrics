# frozen_string_literal: true

class MagicLinkLoginMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email'

  default from: Branding.mail_from("no-reply@#{Settings.domain}")

  def magic_link_email(user)
    @user = user
    @magic_link_url = user.authenticated_sign_in_url
    send_email(
      @user,
      subject: I18n.t('mailer.magic_link.subject'),
      template_path: 'mailer/magic_link_login'
    )
  end
end
