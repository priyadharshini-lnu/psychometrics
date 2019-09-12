# frozen_string_literal: true

class LicenseMailer < ApplicationMailer
  def license_expire(user_id, client_id = nil)
    @resource = User.find(user_id)
    @client = Client.find(client_id) if client_id
    mail(
      to: @resource.email,
      subject: I18n.t('administration.clients.licenses.mailer.license_expire.subject'),
      template_path: '/mailer/license'
    )
  end

  def license_overuse(user_id, client_id = nil)
    @resource = User.find(user_id)
    @client = Client.find(client_id) if client_id
    mail(
      to: @resource.email,
      subject: I18n.t('administration.clients.licenses.mailer.license_overuse.subject'),
      template_path: '/mailer/license'
    )
  end
end
