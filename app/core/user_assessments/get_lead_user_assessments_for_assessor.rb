# frozen_string_literal: true

module UserAssessments
  class GetLeadUserAssessmentsForAssessor < BaseCommand
    attr_reader :campaign_id, :user

    def initialize(campaign_id, user)
      @campaign_id = campaign_id
      @user = user
    end

    def call
      lead_user_assessments =
        UserAssessment.where(
          evaluator_id: user.id, campaign_id: campaign_id, relationship: Relationship.assessor_relationship
        ).joins(:assessment).where(assessments: { category: Assessment::CATEGORIES[:lead_assessor_form] })
      broadcast :ok, lead_user_assessments
    end
  end
end
