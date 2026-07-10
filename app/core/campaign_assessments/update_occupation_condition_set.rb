# frozen_string_literal: true

module CampaignAssessments
  class UpdateOccupationConditionSet < BaseCommand
    private_attr_reader :campaign_assessment, :condition_set_id, :apply_to_existing_users

    def initialize(campaign_assessment, condition_set_id, apply_to_existing_users)
      @campaign_assessment = campaign_assessment
      @condition_set_id = condition_set_id
      @apply_to_existing_users = apply_to_existing_users
    end

    def call
      return broadcast(:ok, campaign_assessment) unless occupations_enabled?

      campaign_assessment.update!(occupation_condition_set_id: condition_set_id)
      rescore_existing_results if apply_to_existing_users

      broadcast(:ok, campaign_assessment)
    end

    private

    def occupations_enabled?
      campaign_assessment.assessment.dimension&.occupations_enabled?
    end

    def rescore_existing_results
      completed_results = UsersResult.
                          joins(:user_assessment).
                          where(user_assessments: { campaign_id: campaign_assessment.campaign_id,
                                                    assessment_id: campaign_assessment.assessment_id,
                                                    status: :completed })

      completed_results.update_all(occupation_condition_set_id: condition_set_id)

      completed_results.in_batches(of: 100) do |batch|
        UsersResults::RescoreOccupationsJob.perform_later(batch.pluck(:id), condition_set_id)
      end
    end
  end
end
