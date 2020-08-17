# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentsController < Administration::Projects::BaseController
      before_action :set_resource
      before_action :pundit_authorize

      def export_raw_results
        results = ::Assessments::Export::RawAndScoring.call!(
          assessment, campaign, export_with_labels: !!params[:with_labels]
        )

        respond_to do |format|
          format.xlsx { send_data results.to_stream.read, filename: "assessment-#{assessment.id}-raw-results.xlsx" }
        end
      end

      def export_scoring_results
        results = ::Assessments::Export::RawAndScoring.call!(assessment, campaign, scoring: true)

        respond_to do |format|
          format.xlsx { send_data results.to_stream.read, filename: "assessment-#{assessment.id}-scoring-results.xlsx" }
        end
      end

      def export_normed_results
        results = Assessments::Export::NormedResult.call!(assessment, campaign)
        respond_to do |format|
          format.xlsx { send_data results.to_stream.read, filename: "assessment-#{assessment.id}-normed-results.xlsx" }
        end
      end

      def export_external_results
        result =
          if assessment.mindmill?
            Assessments::Export::Mindmill.call!(assessment, campaign)
          else
            Assessments::Export::Hogan.call!(assessment, campaign)
          end
        respond_to do |format|
          format.xlsx { send_data result.to_stream.read, filename: "assessment-#{assessment.id}-external-results.xlsx" }
        end
      end

      def rescore_responses
        CampaignAssessments::RecomputeResultsJob.perform_later(campaign_assessment, current_user)
        render json: :ok
      end

      def import_results
        import = ::Imports::Assessments::ResultImportUserResult.new(import_params)
        import.importer = current_user
        import.campaign = campaign
        import.assessment = assessment

        if import.process!
          render json: :ok
        else
          render json: { errors: import.errors.full_messages }, status: :bad_request
        end
      end

      def update_norm
        campaign_assessment.update!(norm_id: params[:norm_id], norm_type: params[:norm_type])

        CampaignAssessments::RecomputeResultsJob.perform_later(campaign_assessment, current_user) if params[:apply]

        render json: {
          norm_name: campaign_assessment.norm.name,
          norm_type: campaign_assessment.norm_type
        }
      end

      private

      def assessment
        resource
      end

      def campaign_assessment
        CampaignAssessment.find_by(assessment: assessment, campaign: campaign)
      end

      def results_params
        params.permit(:scoring, :export_with_labels)
      end

      def resource_class
        Assessment
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:id])
      end

      def import_params
        params.permit(:file, :scoring)
      end
    end
  end
end
