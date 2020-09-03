# frozen_string_literal: true

module CampaignAssessmentGroups
  class Destroy < BaseCommand
    private_attr_reader :campaign, :group

    def initialize(campaign, group)
      @campaign = campaign
      @group = group
    end

    def call
      max_position = campaign.campaign_assessments.where(campaign_assessment_group_id: nil).maximum('position') || 0
      group.campaign_assessments.each do |ca|
        ca.update(position: max_position + 1)
        max_position += 1
      end
      group.delete

      broadcast :ok
    end
  end
end
