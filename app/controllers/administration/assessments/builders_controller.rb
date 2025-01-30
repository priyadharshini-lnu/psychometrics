# frozen_string_literal: true

module Administration
  module Assessments
    class BuildersController < Administration::BaseController
      before_action :set_assessment
      append_before_action :pundit_authorize

      def show
        render json: ::Assessments::AssessmentSerializer.new(
          context: {
            locale: params[:lang] || @assessment.default_language
          }
        ).serialize(@assessment)
      end

      def update
        builder = ::Builders::AssessmentBuilder.new(@assessment, params.require(:builder), current_user)
        if builder.save
          audit! :update, builder.assessment, payload: params.require(:builder)
          render json: { data: ::Assessments::AssessmentSerializer.new(
            context: {
              locale: builder.selected_locale
            }
          ).serialize(@assessment) }
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
        authorize %i[assessments builder]
      end
    end
  end
end
