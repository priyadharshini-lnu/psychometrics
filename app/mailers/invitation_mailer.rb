# frozen_string_literal: true

class InvitationMailer < ApplicationMailer
  layout 'end_user_email'

  def invite(user_id, invited_to_id, token)
    @resource = User.find(user_id)
    @token = token
    client = Client.find(invited_to_id)
    project = client.project
    @subdomain = project.subdomain
    smtp_setting = project.smtp_setting
    mail(
      from: smtp_setting.from_name_and_email,
      to: @resource.email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'invitation_instructions',
      delivery_method_options: smtp_setting.settings_for_email
    )
  end

  def invite_admin(user_id, token)
    @resource = User.find(user_id)
    @token = token
    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: @resource.email,
      subject: I18n.t('devise.mailer.admin_invitation_instructions.subject')
    ) do |format|
      format.html { render(template: '/devise/mailer/admin_invitation_instructions', layout: 'admin_email') }
    end
  end

  def link_to_client(user_id, invited_to_id)
    @resource = User.find(user_id)
    @project = Client.find(invited_to_id).project
    mail(
      to: @resource.email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'link_to_client'
    )
  end
end
