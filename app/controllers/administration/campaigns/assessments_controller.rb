# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentsController < Administration::Projects::BaseController
      before_action :set_resource
      before_action :pundit_authorize

      def export_raw_results
        results = ::Assessments::Export::RawExport.call!(
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
        results = ::Assessments::Export::NormedResult.call!(assessment, campaign)
        respond_to do |format|
          format.xlsx { send_data results.to_stream.read, filename: "assessment-#{assessment.id}-normed-results.xlsx" }
        end
      end

      def export_raw_factor_scores
        results = ::Assessments::Export::RawFactorScores.call!(assessment, campaign)
        respond_to do |format|
          export_file_name = "assessment-#{assessment.id}-raw-factor-scores.xlsx"
          format.xlsx { send_data results.to_stream.read, filename: export_file_name }
        end
      end

      def export_external_results
        result =
          if assessment.mindmill?
            ::Assessments::Export::Mindmill.call!(assessment, campaign)
          else
            ::Assessments::Export::Hogan.call!(assessment, campaign)
          end
        respond_to do |format|
          format.xlsx { send_data result.to_stream.read, filename: "assessment-#{assessment.id}-external-results.xlsx" }
        end
      end

      def rescore_responses
        AdminJob.call(:rescore_assessment, { campaign_id: campaign.id, assessment_id: assessment.id }, current_user)
        render json: :ok
      end

      def destroy
        CampaignAssessments::Remove.call!(
          campaign_assessment, campaign, remove_user_assessments: params[:remove_user_assessments]
        )
        render json: resource.id
      end

      def import_results
        operation = params[:scoring] == 'true' ? :import_scoring_data : :import_raw_data
        AdminJob.call(operation, {
          assessment_id: params[:id],
          campaign_id: params[:new_campaign_id],
          scoring: params[:scoring] == 'true'
        }, current_user, params[:file])
        render json: :ok
      end

      def update_norm
        campaign_assessment.update_norm!(params[:norm_id])

        if params[:apply]
          AdminJob.call(:rescore_assessment, { campaign_id: campaign.id, assessment_id: assessment.id }, current_user)
        end
        render json: { norm_name: campaign_assessment.norm_name }
      end

      def update_assessor_form
        campaign_assessment.update!(assessor_form_id: params[:assessor_form_id])
        render json: {
          assessor_form_name: campaign_assessment.assessor_form&.name,
          assessor_form_id: campaign_assessment.assessor_form&.id
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
        @_resource = Assessment.find(params[:id])
      end

      def pundit_authorize
        authorize(
          campaign_assessment || assessment,
          nil,
          project_id: campaign.project_id
        )
      end

      def import_params
        params.permit(:file, :scoring)
      end
    end
  end
end
