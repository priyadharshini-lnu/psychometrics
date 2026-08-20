# frozen_string_literal: true

class UserMailer < ApplicationMailer
  layout 'admin_email'

  def inactivity_warning(user)
    @user = user
    send_email(
      user,
      subject: I18n.t('mailer.users.warning'),
      template_path: 'mailer/user_management',
      template_name: 'inactivity_warning',
      **admin_sender_attributes((user.project || user.clients.order(:created_at).first)&.client)
    )
  end

  def account_disabled(full_name, email)
    @full_name = full_name
    # rubocop:disable CustomRubocops/AvoidDirectUseOfMailMethod
    mail(
      from: "#{Branding.display_name} <no-reply@#{Settings.domain}>",
      to: email,
      subject: I18n.t('mailer.users.account_disable'),
      template_path: 'mailer/user_management',
      template_name: 'account_disabled'
    )
    # rubocop:enable CustomRubocops/AvoidDirectUseOfMailMethod
  end
end
