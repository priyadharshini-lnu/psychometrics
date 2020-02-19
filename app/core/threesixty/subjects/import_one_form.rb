# frozen_string_literal: true

module Threesixty
  module Subjects
    class ImportOneForm < Rectify::Form
      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :password, String

      validates :password, length: { within: Devise.password_length }, allow_blank: true
      validates :password, allow_blank: true, strong_password: true, if: :enable_strong_password?

      validates :email, :first_name, :last_name, presence: true
      validates :email, format: { with: Devise.email_regexp }

      private

      def enable_strong_password?
        context.campaign.project.strong_password_enabled
      end
    end
  end
end
