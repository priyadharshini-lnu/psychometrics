# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateOneForm < Rectify::Form
      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String

      validates :email, presence: true
      validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }

      validate :check_existing

      def check_existing
        if ::Threesixty::Subject.joins(:user).where(campaign: context.campaign, users: { email: email }).exists?
          errors.add(:email, :already_exists)
        end
      end
    end
  end
end
