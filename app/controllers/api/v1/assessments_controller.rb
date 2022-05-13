# frozen_string_literal: true

module Api
  module V1
    class AssessmentsController < Api::V1::BaseController
      before_action :set_user_assessment, only: %i[update destroy]

      def index
        user_assessments = UserAssessment.where(
          subject_id: user.id,
          evaluator_id: user.id,
          campaign_id: params[:campaign_id] || user.campaigns.last.id
        ).includes(:assessment, :users_result).all

        render json: user_assessments.map { |a| Api::V1::UserAssessmentSerializer.new(a).to_h }
      end

      def update
        @user_assessment.update!(@user_assessment_params)
        audit! :api_update, @user_assessment, payload: params.permit!, campaign: @user_assessment.campaign
        render json: @user_assessment, serializer: Api::V1::UserAssessmentSerializer
      end

      def destroy
        audit! :api_update, @user_assessment, payload: @user_assessment.log_attribute_for_delete,
               campaign: @user_assessment.campaign
        @user_assessment.destroy!
        render json: @user_assessments
      end

      private

      def user_assessment_params
        params.permit(:norm_id)
      end

      def set_user_assessment
        @user_assessment = project.user_assessments.find!(params[:id])
      end

      def pundit_authorize
        authorize(
          @user_assessment || UserAssessment,
          nil,
          policy_class: ::Administration::UserAssessmentPolicy,
          project_id: project.id
        )
      end
    end
  end
end
