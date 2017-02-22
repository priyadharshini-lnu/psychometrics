module Administration
  module Assessments
    class BuildersController < Administration::BaseController
      before_action :set_assessment
      append_before_action :pundit_authorize

      def update
        builder = ::Builders::AssessmentBuilder.new(@assessment, params.require(:builder), current_user)
        if builder.save
          render json: { data: ::Assessments::AssessmentSerializer.new(@assessment).to_hash(include: '**') }
        else
          render json: { error: true }, status: 400
        end
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
