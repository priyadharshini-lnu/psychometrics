# frozen_string_literal: true

module Users
  class ChangePasswordForm < Rectify::Form
    attribute :current_password, String
    attribute :password, String
    attribute :password_confirmation, String

    validates :current_password, :password, :password_confirmation, presence: true
  end
end
