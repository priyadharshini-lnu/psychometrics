# frozen_string_literal: true

module Threesixty
  module Subjects
    class ImportOneForm < Rectify::Form
      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :password, String

      validates :password, length: { within: Devise.password_length }, allow_blank: true
      validates :email, :first_name, :last_name, presence: true
      validates :email, format: { with: Devise.email_regexp }
    end
  end
end
