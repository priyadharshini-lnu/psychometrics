# frozen_string_literal: true

module Workshops
  class CanBookBasedOnSequencing < BaseCommand
    private_attr_reader :campaign_assessment_group, :campaign_id, :subject_id

    def initialize(campaign_assessment_group, subject_id)
      @campaign_assessment_group = campaign_assessment_group
      @subject_id = subject_id
      @campaign_id = campaign_assessment_group.campaign_id
    end

    def call
      return broadcast :ok, true unless campaign_assessment_group.require_previous_groups_completion_for_booking?

      if campaign_assessment_group.require_previous_groups_completion_for_booking? &&
         campaign_assessment_group.position > 1

        previous_groups = CampaignAssessmentGroup.where(
          campaign_id: campaign_id
        ).where('position < ?', campaign_assessment_group.position).
                          includes(:campaign_assessments)

        previous_group_assessment_ids = previous_groups.flat_map(&:campaign_assessments).pluck(:assessment_id)
        previous_groups_deemed_completed = !UserAssessment.self_assessment.deemed_incomplete.exists?(
          campaign_id: campaign_id, subject_id: subject_id, assessment_id: previous_group_assessment_ids
        )
      else
        previous_groups_deemed_completed = true
      end

      broadcast :ok, previous_groups_deemed_completed
    end
  end
end
