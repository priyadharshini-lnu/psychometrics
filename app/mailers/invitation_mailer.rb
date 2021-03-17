# frozen_string_literal: true

class InvitationMailer < ApplicationMailer
  layout 'end_user_email'

  def invite(user_id, invited_to_id, token)
    @resource = User.find(user_id)
    @token = token
    client = Client.find(invited_to_id)
    @subdomain = @resource.is?(:regular) ? client.project.subdomain : nil
    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: @resource.email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'invitation_instructions'
    )
  end

  def invite_admin(user_id, token)
    @resource = User.find(user_id)
    @token = token
    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: @resource.email,
      subject: I18n.t('devise.mailer.admin_invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'admin_invitation_instructions'
    )
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
