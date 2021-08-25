# frozen_string_literal: true

require 'mustache'
class CommunicationEmailMailer < ApplicationMailer
  def create(email_id)
    @communication_email = CommunicationEmail.preload(:communication).find(email_id)
    data = recipient.slice(:first_name, :last_name, :email)
    data[:user_link] = accept_invitation_link
    body = Mustache.render(@communication_email.communication.body, data)
    Rails.logger.info("Email has been sent. Email=#{recipient.email}, Body=#{body}")
    smtp_setting = recipient.project.smtp_setting
    options = {
      from: smtp_setting.from_name_and_email,
      to: recipient.email,
      subject: @communication_email.communication.subject,
      body: body,
      content_type: 'text/html'
    }
    options = options.merge(delivery_method_options: smtp_setting.settings_for_email) if smtp_setting.enabled?
    mail(options)
    @communication_email.update(sent_at: Time.current)
  end

  private

  def entity
    @entity ||= if @communication_email.membership_id
                  Membership.join_user.find(@communication_email.membership_id)
                else
                  @communication_email.campaign_user
                end
  end

  def recipient
    entity.user
  end

  def accept_invitation_link
    if recipient.invitation_accepted?
      options = { domain: Settings.domain, subdomain: entity.project.subdomain }
      url = url_for([:root, options])
    else
      token = create_raw_invitation_token
      options = { id: @recipient_id, invitation_token: token, domain: Settings.domain,
                  subdomain: entity.project.subdomain }
      url = url_for([:accept, recipient.role_scope, :invitation, options])
    end
    "<a href=#{url}> #{I18n.t('devise.mailer.invitation_instructions.accept')} </a>"
  end

  def create_raw_invitation_token
    if recipient.encrypted_invitation_raw.nil?
      recipient.skip_invitation = true
      recipient.send(:generate_invitation_token!)
      recipient.update_column(:invitation_sent_at, DateTime.current)
    end
    Rails.application.
      message_verifier(Rails.application.secrets.secret_token_for_generate).
      verify(recipient.encrypted_invitation_raw)
  end
end
