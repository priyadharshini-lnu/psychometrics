# frozen_string_literal: true

module CampaignResults
  class ScoringAndArtifactsGeneratorJob < ApplicationJob
    queue_as :default

    def perform(campaign, user)
      CampaignScoring::CalculateAndSave.call!(campaign, user)
      Campaigns::AIArtifactResultsGeneration.call(campaign, user)
    end
  end
end
