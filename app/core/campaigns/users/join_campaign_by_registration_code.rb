# frozen_string_literal: true

module Campaigns
  module Users
    class JoinCampaignByRegistrationCode < BaseCommand
      private_attr_reader :user, :campaign, :registration_code, :project, :client, :user, :campaign_user

      def initialize(user, campaign, registration_code)
        @user = user
        @campaign = campaign
        @project = campaign.project
        @registration_code = registration_code
        @client = registration_code.end_level || registration_code.project
      end

      def call
        return broadcast(:error, I18n.t('campaign.already_joined')) if campaign.campaign_users.exists?(user_id: user.id)

        if registration_code.use_count >= registration_code.total_count
          return broadcast(:error, I18n.t('campaign.code_usage_limit_reached'))
        end

        transaction do
          create_campaign_user
          add_reports_and_assessments
          increment_registration_code_usage(registration_code)
          AuditLogModule.audit!(
            :join_campaign, registration_code, user: user, campaign: campaign, payload: { code: registration_code.code }
          )
        end
        broadcast :ok, user
      rescue Licenses::NotEnoughError
        broadcast :error, I18n.t('licenses.not_enough_license_count')
      end

      private

      def create_campaign_user
        @campaign_user = campaign.campaign_users.find_or_create_by(user: user, active: true)
      end

      def increment_registration_code_usage(registration_code)
        registration_code.increment!(:use_count)
      end

      def add_reports_and_assessments
        Campaigns::Users::AddAssignableReportsAndAssessments.call!(campaign, campaign_user, user)
      end
    end
  end
end
