# frozen_string_literal: true

module Campaigns
  module Users
    class CreateForm < Rectify::Form
      mimic :user

      attribute :first_name, String
      attribute :last_name, String
      attribute :email, String
      attribute :mobile_number, String
      attribute :mobile_verified, Boolean
      attribute :operation, String, default: 'add_and_allow_new_response'
      attribute :locale, String
      attribute :schedule_start_date, DateTime
      attribute :schedule_end_date, DateTime
      attribute :gender, String
      attribute :is_uat, Boolean, default: false
      attribute :external_id, String, default: nil
      attribute :current_job_role, String, default: nil
      attribute :target_job_role, String, default: nil
      attribute :level, String, default: nil

      validates :first_name, :last_name, :email, presence: true
      validates :email, format: { with: Devise.email_regexp }
      validates :mobile_number, format: { with: /\A\+(?:[0-9] ?){6,14}[0-9]\z/ }, allow_blank: true
      validates :operation, inclusion: { in: %w[skip_existing add_with_existing_response add_and_allow_new_response] }
      validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
      validate :user_exists_in_project, if: -> { operation == 'skip_existing' }
      validate :user_exists_in_campaign

      validates_datetime :schedule_start_date, allow_blank: true
      validates_datetime :schedule_end_date, allow_blank: true

      def user_exists_in_project
        if User.exists?(project_id: campaign.project_id, email: email) && !campaign.users.exists?(email: email)
          errors.add(:email, :user_exists_in_project)
        end
      end

      def user_exists_in_campaign
        errors.add(:email, :user_exists_in_campaign) if campaign.users.exists?(email: email)
      end

      def active
        true
      end

      private

      def campaign
        context.campaign
      end
    end
  end
end
