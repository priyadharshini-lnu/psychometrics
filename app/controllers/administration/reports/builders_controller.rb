# frozen_string_literal: true

module Administration
  module Reports
    class BuildersController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      before_action :set_report
      append_before_action :pundit_authorize

      def show
        Mobility.with_locale(params[:lang] || @report.default_language) do
          render json: ReportSerializer.new(
            context: {
              builder: true,
              lang: params[:lang]
            }
          ).serialize(@report)
        end
      end

      def update
        builder = ::Builders::ReportBuilder.new(@report, params.require(:builder), current_user)
        if builder.save
          audit! :update, @report, payload: params.require(:builder)
          @report = Report.includes(pages: [:modules]).find(@report.id)
          render json: { data: ReportSerializer.new(
            context: {
              builder: true,
              include: '**'
            }
          ).serialize(@report) }
        else
          render json: { error: true, message: builder.errors.flatten }, status: 400
        end
      end

      def upload_campaign_factors
        form = ::Administration::CampaignFactors::ImportForm.new(
          file: params[:file],
          resource_id: params[:report_id],
          resource_class: 'Report'
        )

        if form.valid?
          render json: form.processed_data, status: :ok
        else
          render json: { errors: form.errors.messages.values.flatten }, status: :unprocessable_entity
        end
      end

      def upload_campaign_ai_artifacts
        form = ::Administration::CampaignAIArtifacts::ImportForm.new(
          file: params[:file],
          resource_id: params[:report_id],
          resource_class: 'Report'
        )

        if form.valid?
          render json: form.processed_data, status: :ok
        else
          render json: { errors: form.errors.messages.values.flatten }, status: :unprocessable_entity
        end
      end

      private

      def set_report
        @report = policy_scope(::Report).find(params[:report_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize %i[reports builder]
      end
    end
  end
end
