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
  end

  private

  def accept_invitation_link
    #options = {id: @recipient.user_id, invitation_token: @recipient.user.invitation_token, domain: Settings.domain, subdomain: @project.subdomain}
    #@project = Client.find(@recipient.client_id).project
    url = url_for([:accept, @recipient.user.role_scope, :invitation])
    "<a href=#{url}> #{I18n.t('devise.mailer.invitation_instructions.accept')} </a>"
  end
end
