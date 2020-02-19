# frozen_string_literal: true

module Users
  class ProfileForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :password, String

    validates :first_name, :last_name, presence: true
    validates :password, length: { within: Devise.password_length }, allow_blank: true
    validates :password, strong_password: true, if: :enable_strong_password?

    private

    def enable_strong_password?
      context.user.project.strong_password_enabled
    end
  end
end
