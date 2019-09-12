# frozen_string_literal: true

class InvitationMailer < ApplicationMailer
  def invite(user_id, invited_to_id, token)
    @resource = User.find(user_id)
    @token = token
    @project = Client.find(invited_to_id).project
    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: @resource.email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'invitation_instructions'
    )
  end

  def invite_superadmin(user_id, token)
    @resource = User.find(user_id)
    @token = token
    mail(
      from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
      to: @resource.email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'superadmin_invitation_instructions'
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
