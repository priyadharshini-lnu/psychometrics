require 'mustache'
class CommunicationEmailMailer < ApplicationMailer
  def create(email_id)
    communication_mail = CommunicationEmail.preload(:communication).find(email_id)
    @recipient = Membership.join_user.find(communication_mail.membership_id)
    data = @recipient.slice(:first_name, :last_name, :email)
    data[:user_link] = accept_invitation_link
    body = Mustache.render(communication_mail.communication.body, data)
    mail(
      to: @recipient.email,
      subject: communication_mail.communication.subject,
      body: body,
      content_type: 'text/html'
    )
    communication_mail.update(sent_at: Time.current)
  end

  private

  def accept_invitation_link
    @project = Client.find(@recipient.client_id).project
    if @recipient.user.invitation_accepted?
      options = { domain: Settings.domain, subdomain: @project.subdomain }
      url = url_for([:root, options])
    else
      token = create_raw_invitation_token
      options = { id: @recipient.user_id, invitation_token: token, domain: Settings.domain,
                  subdomain: @project.subdomain
                }
      url = url_for([:accept, @recipient.user.role_scope, :invitation, options])
    end
    "<a href=#{url}> #{I18n.t('devise.mailer.invitation_instructions.accept')} </a>"
  end

  def create_raw_invitation_token
    if @recipient.user.encrypted_invitation_raw.nil?
      @recipient.user.skip_invitation = true
      @recipient.user.send(:generate_invitation_token!)
      @recipient.user.update_column(:invitation_sent_at, DateTime.current)
    end
    Rails.application.message_verifier(Rails.application.secrets.secret_token_for_generate).verify(@recipient.user.encrypted_invitation_raw)
  end
end
