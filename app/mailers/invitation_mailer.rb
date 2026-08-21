# frozen_string_literal: true

class InvitationMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email'

  def invite(user_id, invited_to_id, token)
    @resource = User.find(user_id)
    @token = token
    client = Client.find(invited_to_id)
    project = client.project
    @subdomain = project.subdomain
    smtp_setting = project.smtp_setting
    send_email(
      @resource,
      from: smtp_setting.from_name_and_email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: 'devise/mailer',
      template_name: 'invitation_instructions',
      delivery_method_options: smtp_setting.settings_for_email
    )
  end

  def invite_admin(user_id, token)
    @resource = User.find(user_id)
    @token = token
    send_email(
      @resource,
      subject: I18n.t('devise.mailer.admin_invitation_instructions.subject'),
      **admin_sender_attributes((@resource.project || @resource.clients.first)&.client)
    ) do |format|
      format.html { render(template: '/devise/mailer/admin_invitation_instructions', layout: 'admin_email') }
    end
  end

  def link_to_client(user_id, membership)
    @resource = User.find(user_id)
    if membership.campaign
      @section = 'campaign'
      user_locale = @resource.locale || I18n.default_locale
      @section_name = Mobility.with_locale(user_locale) { membership.campaign.name }
    elsif membership.client.project?
      @section = 'project'
      @section_name = membership.client.name
    else
      @section = 'client'
      @section_name = membership.client.name
    end

    tenancy = membership.client&.client
    @sign_in_url = tenancy.admin_url

    send_email(
      @resource,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      **admin_sender_attributes(tenancy)
    ) do |format|
      format.html { render(template: '/devise/mailer/link_to_client', layout: 'admin_email') }
    end
  end
end
