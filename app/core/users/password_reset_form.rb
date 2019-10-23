# frozen_string_literal: true

module Users
  class PasswordResetForm < Rectify::Form
    attribute :email, String
    attribute :user

    validates :email, presence: true
    validates :email, format: { with: Devise.email_regexp }

    validate :check_email_exists!

    def check_email_exists!
      project = GetProjectBySubdomain.call!(context.subdomain)

      @user = project ? project.users.find_by(email: email) : User.find_by(email: email, project: nil)

      errors.add(:email, :wrong_email)
    end
  end
end
