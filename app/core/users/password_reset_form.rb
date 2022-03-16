# frozen_string_literal: true

module Users
  class PasswordResetForm < Rectify::Form
    attribute :email, String

    validates :email, presence: true
    validates :email, format: { with: Devise.email_regexp }, allow_blank: true
  end
end
