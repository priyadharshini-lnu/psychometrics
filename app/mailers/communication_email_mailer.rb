require 'mustache'
class CommunicationEmailMailer < ApplicationMailer
  def create(email_id)
    communication_mail = CommunicationEmail.preload(:communication).find(email_id)
    copy_recipients_emails = Membership.join_user.where(id: communication_mail.communication.copy_membership_ids).pluck(:email)
    @recipient = Membership.join_user.find(communication_mail.membership_id)
    body = Mustache.render(communication_mail.communication.body, @recipient.slice(:first_name, :last_name, :email))
    mail(
      to: @recipient.email,
      cc: copy_recipients_emails,
      subject: communication_mail.communication.subject,
      body: body,
      content_type: 'text/html'
    )
  end
end
