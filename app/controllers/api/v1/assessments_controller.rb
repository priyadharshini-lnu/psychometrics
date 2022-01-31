# frozen_string_literal: true

module Api
  module V1
    class AssessmentsController < Api::V1::BaseController
      def index
        user_assessments = UserAssessment.where(
          subject_id: user.id,
          evaluator_id: user.id,
          campaign_id: params[:campaign_id] || user.campaigns.last.id
        ).includes(:assessment, :users_result).all

        render json: user_assessments.map { |a| Api::V1::UserAssessmentSerializer.new(a).to_h }
      end

      def update
        user_assessment = UserAssessment.find!(params[:id])
        user_assessment.update!(user_assessment_params)
        audit! :api_update, user_assessment, payload: params.permit!, campaign: user_assessment.campaign
        render json: user_assessment, serializer: Api::V1::UserAssessmentSerializer
      end

      def destroy
        user_assessment = UserAssessment.find(params[:id])
        audit! :api_update, user_assessment, payload: user_assessment.log_attribute_for_delete,
               campaign: user_assessment.campaign
        user_assessment.destroy!
        render json: user_assessments
      end

      private

      def user_assessment_params
        params.permit(:norm_id)
      end
    end
  end
end
