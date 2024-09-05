# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentsController < Administration::Projects::BaseController # rubocop:disable Metrics/ClassLength
      before_action :set_resource, except: [:other]
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

      def other
        excluded_assessment_ids = campaign.campaign_assessments.map(&:assessment_id)
        user_assessments = campaign.user_assessments.where.not(assessment_id: excluded_assessment_ids).
                           preload(:assessment).
                           select(:assessment_id).
                           distinct(:assessment_id).
                           order(assessment_id: :desc)

        list = Panko::ArraySerializer.new(
          user_assessments.page(params[:page]).per(params[:size]).map(&:assessment),
          each_serializer: Campaigns::OtherAssessmentSerializer,
          context: {
            current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
          }
        ).to_a

        render json: {
          list: list,
          total: user_assessments.count
        }
      end

      def rescore_responses
        AdminJob.call(:rescore_assessment, { campaign_id: campaign.id, assessment_id: assessment.id }, current_user)
        render json: :ok
      end

      def destroy
        remove_user_assessments = current_user.is?(:superadmin) && params[:remove_user_assessments]
        audit! :delete, campaign_assessment, campaign: campaign,
          payload: campaign_assessment.log_attributes.merge(remove_user_assessments: remove_user_assessments)
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

        if params[:apply] && params[:norm_id].present?
          AdminJob.call(:rescore_assessment,
                        {
                          campaign_id: campaign.id,
                          assessment_id: assessment.id,
                          norm_id: params[:norm_id]
                        },
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

      def update_prework
        campaign_assessment.update!(prework: params[:prework])
        render json: Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def update_workshop_activity
        form = ::Campaigns::WorkshopActivityDurationForm.from_params(params)
        if form.valid?
          attributes = form.attributes
          campaign_assessment.update!(attributes)
          render json: Administration::CampaignAssessmentSerializer.new(
            context: {
              current_user: current_user,
              project_id: campaign.project_id,
              campaign_id: campaign.id
            }
          ).serialize(campaign_assessment)
        else
          render json: { errors: form.errors.messages }, status: :unprocessable_entity
        end
      end

      def toggle_require_scheduling
        campaign_assessment.update!(require_scheduling: params[:require_scheduling])

        render json: Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def toggle_auto_assign
        campaign_assessment.update!(auto_assign: params[:auto_assign])
        audit! :toggle_auto_assign, campaign_assessment, payload: { auto_assign: campaign_assessment.auto_assign },
        campaign: campaign

        render json: Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def schedule_assessment
        CampaignAssessment.transaction do
          scope = UserAssessment.where(assessment_id: assessment.id, campaign_id: campaign.id, status: :not_started)
          scope = scope.where(schedule_time: nil) unless params[:override_existing]
          scope.update_all(schedule_time: params[:schedule_time])
        end

        return head :ok unless campaign_assessment

        render json: Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def update_mettl_schedule
        campaign_assessment.update_mettl_schedule!(params[:mettl_schedule_record_id], params[:apply])

        audit! :update_mettl_schedule, assessment, campaign: campaign

        render json: { mettl_schedule_name: campaign_assessment.mettl_schedule_record&.schedule_name }
      end

      private

      def assessment
        resource
      end

      def campaign_assessment
        @campaign_assessment ||= CampaignAssessment.find_by(assessment: assessment, campaign: campaign)
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
