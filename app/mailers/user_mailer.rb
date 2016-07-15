class UserMailer < ApplicationMailer

  def send_invitation(user)
    mail(to: user.email, subject: "#{Settings.project_name}: #{I18n.t('administration.user_mailer.send_invitation.invitation')}" )
  end

end
