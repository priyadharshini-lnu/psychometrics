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
          campaign_assessment_group = campaign_assessment_groups.find_by(id: ca['campaign_assessment_group_id'])

          validate_duration_form(campaign_assessment_group, ca['workshop_activity_duration'])

          campaign.campaign_assessments.find(ca['id']).
            update!(
              campaign_assessment_group_id: ca['campaign_assessment_group_id'],
              position: ca['position'],
              workshop_activity: campaign_assessment_group&.assessment_center? || false,
              workshop_activity_duration: ca['workshop_activity_duration']
            )
        end
      end
      broadcast :ok
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end

    private

    def campaign_assessment_groups
      @campaign_assessment_groups ||= campaign.campaign_assessment_groups
    end

    def validate_duration_form(campaign_assessment_group, workshop_activity_duration)
      return true if campaign_assessment_group.blank?

      duration_form = ::Campaigns::WorkshopActivityDurationForm.from_params(
        workshop_activity_duration: workshop_activity_duration,
        workshop_activity: campaign_assessment_group.assessment_center?
      )

      unless duration_form.valid?
        broadcast :error, [{ base: duration_form.errors.full_messages.join(', ') }]
        raise ActiveRecord::Rollback
      end

      true
    end
  end
end
