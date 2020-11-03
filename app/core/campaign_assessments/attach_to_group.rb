# frozen_string_literal: true

module CampaignAssessments
  class AttachToGroup < BaseCommand
    private_attr_reader :campaign_assessment, :group_id, :position

    def initialize(campaign_assessment, group_id, position)
      @campaign_assessment = campaign_assessment
      @group_id = group_id
      @position = position
    end

    def call
      CampaignAssessment.
        where(campaign_assessment_group_id: group_id).
        where("position >= #{position}").
        each { |ca| ca.update(position: ca.position + 1) }
      campaign_assessment.update(position: position, campaign_assessment_group_id: group_id)
      broadcast :ok
    end
  end
end
