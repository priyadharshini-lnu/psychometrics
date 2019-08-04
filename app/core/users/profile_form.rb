# frozen_string_literal: true

module Users
  class ProfileForm < Rectify::Form
    attribute :first_name, String
    attribute :last_name, String
    attribute :password, String

    validates :first_name, :last_name, presence: true
    validates :password, length: { within: Devise.password_length }, allow_nil: true
  end
end
