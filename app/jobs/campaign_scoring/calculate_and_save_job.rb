# frozen_string_literal: true

module CampaignScoring
  class CalculateAndSaveJob < ApplicationJob
    queue_as :default

    def perform(campaign, user)
      CampaignScoring::CalculateAndSave.call!(campaign, user)
    end
  end
end
