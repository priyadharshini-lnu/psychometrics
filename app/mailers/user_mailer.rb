# frozen_string_literal: true

class UserMailer < ApplicationMailer
  layout 'admin_email'

  def inactivity_warning(user)
    @user = user
    send_email(
      user,
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      subject: I18n.t('mailer.users.warning'),
      template_path: 'mailer/user_management',
      template_name: 'inactivity_warning'
    )
  end

  def account_disabled(full_name, email)
    @full_name = full_name
    # rubocop:disable CustomRubocops/AvoidDirectUseOfMailMethod
    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: email,
      subject: I18n.t('mailer.users.account_disable'),
      template_path: 'mailer/user_management',
      template_name: 'account_disabled'
    )
    # rubocop:enable CustomRubocops/AvoidDirectUseOfMailMethod
  end
end
