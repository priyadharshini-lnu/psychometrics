# frozen_string_literal: true

module AdminJobs
  class ImportCampaignAIArtifactsJob < AdminJobs::Base
    def call
      Administration::ImportCampaignAIArtifacts.new(
        record.file,
        record.data['campaign_id']
      ).call

      broadcast :ok
    end
  end
end
