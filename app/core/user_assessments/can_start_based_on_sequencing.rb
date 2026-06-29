# frozen_string_literal: true

module UserAssessments
  class CanStartBasedOnSequencing < BaseCommand
    private_attr_reader :user_assessment, :campaign_id

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @campaign_id = user_assessment.campaign_id
    end

    def call # rubocop:disable Metrics/PerceivedComplexity
      campaign_assessment = user_assessment.campaign_assessment
      campaign_assessment_group = campaign_assessment&.campaign_assessment_group

      return broadcast :ok, true if campaign_assessment.nil? || campaign_assessment_group.nil?

      if campaign_assessment_group.previous_group_required? && campaign_assessment_group.position > 1
        previous_group_assessment_ids = CampaignAssessment.joins(:campaign_assessment_group).where(
          campaign_id: campaign_id,
          campaign_assessment_groups: { position: campaign_assessment_group.position - 1 }
        ).pluck(:assessment_id)

        previous_group_deemed_completed = previous_group_assessment_ids.empty? ||
                                          !UserAssessment.self_assessment.deemed_incomplete.exists?(
                                            campaign_id: campaign_id,
                                            subject_id: user_assessment.subject_id,
                                            assessment_id: previous_group_assessment_ids
                                          )
      else
        previous_group_deemed_completed = true
      end

      if campaign_assessment_group.previous_assessments_required? && campaign_assessment.position > 1
        previous_campaign_assessment_ids = CampaignAssessment.where(
          campaign_assessment_group_id: campaign_assessment_group.id
        ).where('position < ?', campaign_assessment.position).pluck(:assessment_id)
        previous_assessment_deemed_completed = !UserAssessment.self_assessment.deemed_incomplete.exists?(
          campaign_id: campaign_id, subject_id: user_assessment.subject_id,
          assessment_id: previous_campaign_assessment_ids
        )
      else
        previous_assessment_deemed_completed = true
      end

      broadcast :ok, previous_assessment_deemed_completed && previous_group_deemed_completed
    end
  end
end
