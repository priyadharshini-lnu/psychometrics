# frozen_string_literal: true

module AI
  module CampaignArtifacts
    class Processor < BaseCommand
      private_attr_reader :campaign, :user, :current_user, :admin_job_record

      def initialize(campaign, user, current_user = nil, admin_job_record = nil)
        @campaign = campaign
        @user = user
        @current_user = current_user || user # Defaults to user if current_user is not provided
        @admin_job_record = admin_job_record
      end

      def call
        options = {
          current_user: current_user,
          force_regenerate: false
        }
        campaign_ai_artifacts.each do |artifact|
          AICampaignArtifactResultsGeneratorJob.perform_later(
            artifact,
            user,
            admin_job_record,
            options
          )
        end

        broadcast(:ok, {})
      end

      private

      def campaign_ai_artifacts
        @campaign_ai_artifacts ||= campaign.campaign_ai_artifacts
      end
    end
  end
end
