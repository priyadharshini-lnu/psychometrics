# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::UsersController < Api::V2::Administration::BaseController
    def assessors_scores
      assessor_user_assessments = UserAssessment.scored.where(
        relationship: Relationship.assessor_relationship,
        campaign_id: campaign.id, subject_id: model.id
      ).includes(:assessment, :evaluator, :users_result)

      data = Panko::ArraySerializer.new(
        assessor_user_assessments,
        each_serializer: ::AssessorScoresSerializer,
        context: { campaign: campaign }
      )

      render json: json_api_records(data.as_json, :assessor_scores)
    end

    def policy_class
      @policy_class ||= Api::Administration::Campaigns::UserPolicy
    end
  end
end
