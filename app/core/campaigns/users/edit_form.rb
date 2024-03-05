# frozen_string_literal: true

module Campaigns
  module Users
    class EditForm < Rectify::Form
      mimic :user

      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :locale, String

      validates :first_name, :last_name, :email, presence: true
      validates :email, format: { with: Devise.email_regexp }
      validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
      validate :user_exists_in_campaign

      def user_exists_in_campaign
        errors.add(:email, :user_exists_in_campaign) if campaign.users.where.
                                                        not(id: current_campaign_user_id).exists?(email: email)
      end

      private

      def campaign
        context.campaign
      end

      def current_campaign_user_id
        context.current_campaign_user_id
      end
    end
  end
end
