class InvitationMailer < ApplicationMailer
  def invite(user_id, invited_to_id)
    @resource = User.find(user_id)
    @client = Client.find(invited_to_id)
    mail(
      to: @resource.email,
      subject: I18n.t('devise.mailer.invitation_instructions.subject'),
      template_path: '/devise/mailer',
      template_name: 'invitation_instructions'
    )
  end
end
