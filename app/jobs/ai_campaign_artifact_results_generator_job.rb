# frozen_string_literal: true

class AICampaignArtifactResultsGeneratorJob < ApplicationJob
  def perform(campaign_artifact, user, admin_job_record = nil, options = {})
    AI::CampaignArtifacts::ResultGenerator.call(campaign_artifact, user, options)

    admin_job_record&.increment_completed_tasks!
  end
end
