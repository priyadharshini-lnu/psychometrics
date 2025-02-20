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

    def active_idp_template
      user = User.find(params[:id])
      idp_template = user.active_user_idp_plan&.idp_template

      if idp_template
        jsonapi_render json: user.active_user_idp_plan,
                       options: { resource: ::Api::V2::Administration::UserIdpPlanResource }
      else
        render json: { error: I18n.t('idp_templates.errors.idp_template_not_found') }, status: :not_found
      end
    end

    def policy_class
      @policy_class ||= Api::Administration::Campaigns::UserPolicy
    end
  end
end
