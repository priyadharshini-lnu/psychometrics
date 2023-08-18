# frozen_string_literal: true

class LicenseMailer < ApplicationMailer
  layout 'admin_email'

  def license_expire(user_id, client_id = nil)
    @resource = User.find(user_id)
    @client = Client.find(client_id) if client_id
    mail(
      to: @resource.email,
      subject: I18n.t('mailer.license.expire.subject'),
      template_path: 'mailer/license'
    )
  end

  def license_overuse(user_id, client_id = nil)
    @resource = User.find(user_id)
    @client = Client.find(client_id) if client_id
    mail(
      to: @resource.email,
      subject: I18n.t('mailer.license.overuse.subject'),
      template_path: 'mailer/license'
    )
  end

  def weekly_stats(user_id)
    @resource = User.find(user_id)
    @stats = Licenses::GetStats.call!
    mail(
      to: @resource.email,
      subject: I18n.t('mailer.license.weekly_stats.subject'),
      template_path: 'mailer/license'
    )
  end
end
