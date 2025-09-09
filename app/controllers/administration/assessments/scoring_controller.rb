# frozen_string_literal: true

module Administration
  module Assessments
    class ScoringController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      before_action :set_assessment
      append_before_action :pundit_authorize

      def update
        scoring = ::Builders::ScoringBuilder.new(
          @assessment,
          params[:scoring],
          params[:question_recoding],
          current_user
        )
        scoring.save!
        render json: { data: ::Assessments::AssessmentSerializer.new(
          context: {
            include: '**'
          }
        ).serialize(@assessment) }
      end

      private

      def set_assessment
        @assessment = policy_scope(::Assessment).find(params[:assessment_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize %i[assessments builder]
      end
    end
  end
end
