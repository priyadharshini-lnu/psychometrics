# frozen_string_literal: true

module Campaigns
  module Users
    class JoinCampaignByToken < BaseCommand
      private_attr_reader :user, :project, :campaign, :token, :campaign_user

      def initialize(user, token)
        @user = user
        @project = user.project
        @token = token
      end

      def call
        data = ::Campaigns::JwtTokenizer.decode(token)
        return broadcast(:error, I18n.t('registration_code.token_expired')) unless data

        campaign = project.project_campaigns.find_by(id: data['campaign_id'])
        if !campaign || user.id != data['subject_id']
          return broadcast(:error, I18n.t('registration_code.invalid_token'))
        end
        return broadcast(:error, I18n.t('campaign.already_joined')) if campaign.campaign_users.exists?(user_id: user.id)

        transaction do
          create_campaign_user
          Campaigns::Users::AddAssignableReportsAndAssessments.call!(campaign, campaign_user, user)
          AuditLogModule.audit!(
            :join_campaign, user, user: user, campaign: campaign, payload: {}
          )
        end
        broadcast :ok, user
      rescue Licenses::NotEnoughError => e
        broadcast :error, e.message
      end

      private

      def create_campaign_user
        @campaign_user = campaign.campaign_users.find_or_create_by(user: user, active: true)
      end
    end
  end
end
