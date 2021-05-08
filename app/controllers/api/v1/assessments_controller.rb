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
    end
  end
end
