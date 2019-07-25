module Administration
  module Assessments
    class ScoringController < Administration::BaseController
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
        render json: { data: ::Assessments::AssessmentSerializer.new(@assessment).to_hash(include: '**') }
      end

      private

      def set_assessment
        @assessment = policy_scope(::Assessment).find(params[:assessment_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize [:assessments, :builder]
      end
    end
  end
end
