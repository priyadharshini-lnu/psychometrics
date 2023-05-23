# frozen_string_literal: true

class SendPasswordMailer < ApplicationMailer
  def password_email(user, password)
    @user = user
    @password = password
    mail(
      to: @user.email,
      subject: "Your Lighthouse Account password for #{@user.email} has been reset by your administrator."
    ) do |format|
      format.html do
        layout = @user.is?(:regular) ? 'mailer/layouts/end_user_email' : 'admin_email'
        render(template: '/mailer/reset_password/password_email', layout: layout)
      end
    end
  end
end
