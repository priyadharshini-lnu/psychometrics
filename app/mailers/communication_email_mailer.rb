class CommunicationEmailMailer < ApplicationMailer
  def create(email_id)
    communication_mail = CommunicationEmail.preload(:communication).find(email_id)
    copy_recipients_emails = Membership.join_user.where(id: communication_mail.communication.copy_membership_ids).pluck(:email)
    @recipient = Membership.join_user.find(communication_mail.membership_id)
    mail(
      to: @recipient.email,
      cc: copy_recipients_emails,
      subject: communication_mail.communication.subject,
      body: communication_mail.communication.body,
      content_type: 'text/html'
    )
  end
end
