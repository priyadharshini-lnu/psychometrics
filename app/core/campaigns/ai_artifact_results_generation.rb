# frozen_string_literal: true

module Campaigns
  class AIArtifactResultsGeneration < BaseCommand
    private_attr_reader :campaign, :user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
    end

    # Logging the automatic generation for debugging purposes
    # This will help in tracking the automatic trigger generation process in production logs
    def call
      return unless ai_assistants_feature_enabled?

      Rails.logger.info 'Generating AI artifacts results for ' \
                        "campaign #{campaign.id}, user #{user.id}"

      AI::CampaignArtifacts::Processor.call(campaign, user)
      broadcast(:ok, {})
    rescue StandardError => e
      Rails.logger.error 'Failed to generate AI artifacts results for ' \
                         "campaign #{campaign.id}, user #{user.id}: #{e.message}"
      # Don't re-raise the error as we don't want to fail the main scoring job
      Sentry.capture_exception(e)
      broadcast(:error, e.message)
    end

    private

    def ai_assistants_feature_enabled?
      platform_feature_enabled = Settings.features[:ai_assistant_enabled]

      platform_feature_enabled && campaign.project.project_feature_enabled?(:ai_assistants)
    end
  end
end
