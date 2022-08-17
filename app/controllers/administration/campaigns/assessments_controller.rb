# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentsController < Administration::Projects::BaseController
      before_action :set_resource
      before_action :pundit_authorize

      def export_raw_results
        with_labels = params[:with_labels] == 'true'
        AdminJob.call(
          :assessment_raw_result_export,
          { assessment_id: assessment.id, campaign_id: campaign.id, export_with_labels: with_labels },
          current_user
        )

        head :ok
      end

      def export_scoring_results
        AdminJob.call(
          :assessment_scoring_export,
          { assessment_id: assessment.id, campaign_id: campaign.id },
          current_user
        )

        head :ok
      end

      def export_normed_results
        AdminJob.call(
          :assessment_norm_export,
          { assessment_id: assessment.id, campaign_id: campaign.id },
          current_user
        )

        head :ok
      end

      def export_raw_factor_scores
        AdminJob.call(
          :assessment_raw_factor_export,
          { assessment_id: assessment.id, campaign_id: campaign.id },
          current_user
        )

        head :ok
      end

      def export_external_results
        AdminJob.call(
          :external_assessment_export,
          { assessment_id: assessment.id, campaign_id: campaign.id },
          current_user
        )

        head :ok
      end

      def rescore_responses
        AdminJob.call(:rescore_assessment, { campaign_id: campaign.id, assessment_id: assessment.id }, current_user)
        render json: :ok
      end

      def destroy
        remove_user_assessments = current_user.is?(:superadmin) && params[:remove_user_assessments]
        audit! :delete, campaign_assessment, campaign: campaign,
          payload: { remove_user_assessments: remove_user_assessments }
        CampaignAssessments::Remove.call!(
          campaign_assessment, campaign, remove_user_assessments: remove_user_assessments
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
          AdminJob.call(:rescore_assessment,
                        { campaign_id: campaign.id, assessment_id: assessment.id, fixed_norm: true },
                        current_user)
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

      def update_available_locales
        campaign_assessment.update!(available_locales: params[:available_locales] || [])
        render json: {
          available_locales: campaign_assessment.available_locales
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
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def import_params
        params.permit(:file, :scoring)
      end
    end
  end
end
