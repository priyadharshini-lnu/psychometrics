# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateOneForm < Rectify::Form
      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :locale, String

      validates :email, :first_name, :last_name, presence: true
      validates :email, format: { with: Devise.email_regexp }
      validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }

      validate :check_existing

      def check_existing
        if ::Threesixty::Subject.joins(:user).where(campaign: context.campaign, users: { email: email }).exists?
          errors.add(:email, :already_exists)
        end
      end
    end
  end
end
