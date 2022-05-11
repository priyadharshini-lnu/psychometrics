# frozen_string_literal: true

module CampaignAssessments
  class UpdatePositions < BaseCommand
    private_attr_reader :campaign, :campaign_assessments

    def initialize(campaign, campaign_assessments)
      @campaign = campaign
      @campaign_assessments = campaign_assessments
    end

    def call
      transaction do
        campaign_assessments.each do |ca|
          campaign.campaign_assessments.find(ca['id']).
            update(campaign_assessment_group_id: ca['campaign_assessment_group_id'], position: ca['position'])
        end
      end
      broadcast :ok
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
