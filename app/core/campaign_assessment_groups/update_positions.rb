# frozen_string_literal: true

module CampaignAssessmentGroups
  class UpdatePositions < BaseCommand
    private_attr_reader :campaign, :groups

    def initialize(campaign, groups)
      @campaign = campaign
      @groups = groups
    end

    def call
      transaction do
        groups.each do |ca|
          campaign.campaign_assessment_groups.find(ca['id']).
            update(id: ca['id'], position: ca['position'])
        end
      end
      broadcast :ok
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
