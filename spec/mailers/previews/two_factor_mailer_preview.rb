# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/two_factor_mailer
class TwoFactorMailerPreview < ActionMailer::Preview
  def two_factor_code_email
    user = build(:user)

    TwoFactorMailer.two_factor_code_email(user, '123456')
  end
end
