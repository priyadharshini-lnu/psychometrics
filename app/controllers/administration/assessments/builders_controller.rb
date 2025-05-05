# frozen_string_literal: true

module Administration
  module Assessments
    class BuildersController < Administration::BaseController
      before_action :set_assessment, except: %i[upload_campaign_factors]
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

      def upload_campaign_factors
        form = ::Administration::CampaignFactors::ImportForm.new(
          file: params[:file],
          resource_id: params[:assessment_id],
          resource_class: 'Assessment'
        )

        if form.valid?
          render json: form.processed_data, status: :ok
        else
          render json: { errors: form.errors.messages.values.flatten }, status: :unprocessable_entity
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
