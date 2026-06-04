# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentsController < Administration::Projects::BaseController # rubocop:disable Metrics/ClassLength
      before_action :set_resource, except: [:other]
      before_action :pundit_authorize

      def export_raw_results
        with_labels = params[:with_labels]&.to_s == 'true'
        audit! :export_raw_results, assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment&.id }
        AdminJob.call(
          :assessment_raw_result_export,
          { assessment_id: assessment.id, campaign_id: campaign.id,
            export_with_labels: with_labels, include_inactive_users: include_inactive_users },
          current_user
        )

        head :ok
      end

      def export_occupations
        audit! :export_occupations, assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment&.id }
        AdminJob.call(
          :export_occupations,
          { assessment_id: assessment.id, campaign_id: campaign.id },
          current_user
        )

        head :ok
      end

      def export_scoring_results
        audit! :export_scoring_results, assessment, campaign: campaign,
          user: current_user,
          payload:
          { campaign_assessment_id: campaign_assessment&.id,
            campaign_id: campaign.id }
        AdminJob.call(
          :assessment_scoring_export,
          { assessment_id: assessment.id, campaign_id: campaign.id, include_inactive_users: include_inactive_users },
          current_user
        )

        head :ok
      end

      def export_normed_results
        audit! :export_normed_results, assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment&.id }
        AdminJob.call(
          :assessment_norm_export,
          { assessment_id: assessment.id, campaign_id: campaign.id, include_inactive_users: include_inactive_users },
          current_user
        )

        head :ok
      end

      def export_raw_factor_scores
        audit! :export_raw_factor_scores, assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment&.id }
        AdminJob.call(
          :assessment_raw_factor_export,
          { assessment_id: assessment.id, campaign_id: campaign.id, include_inactive_users: include_inactive_users },
          current_user
        )

        head :ok
      end

      def export_external_results
        audit! :export_external_results, assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment&.id }
        AdminJob.call(
          :external_assessment_export,
          { assessment_id: assessment.id, campaign_id: campaign.id },
          current_user
        )

        head :ok
      end

      def normalize_factor_scores
        audit! :normalize_factor_scores, assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment&.id }
        AdminJob.call(
          :normalize_factor_scores,
          { campaign_assessment_id: campaign_assessment&.id },
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
        AdminJob.call(
          :rescore_assessment,
          { campaign_id: campaign.id, assessment_id: assessment.id,
            allow_ai_rescore: params[:allow_ai_rescore].to_s == 'true' },
          current_user
        )
        audit! :rescore_responses, campaign_assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, assessment_id: assessment&.id }
        render json: :ok
      end

      def regenerate_transcriptions
        audit! :regenerate_transcriptions, campaign_assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment.id }
        AdminJob.call(
          :regenerate_assessment_transcriptions,
          { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment.id },
          current_user
        )
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
        audit! :import_results, assessment, campaign: campaign, payload: params
        AdminJob.call(operation, {
          assessment_id: params[:id],
          campaign_id: params[:new_campaign_id],
          scoring: params[:scoring] == 'true'
        }, current_user, params[:file])
        render json: :ok
      end

      def import_external_scoring_results
        AdminJob.call(:import_external_scoring_data, {
          assessment_id: params[:id],
          campaign_id: params[:new_campaign_id]
        }, current_user, params[:file])

        audit! :import_external_scoring_results, assessment, campaign: campaign, payload: params

        render json: :ok
      end

      def update_norm
        campaign_assessment.update_norm!(params[:norm_id])
        audit! :update_norm, campaign_assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment.id }

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
        audit! :update_assessor_form, campaign_assessment, user: current_user,
          payload: { assessor_form_id: params[:assessor_form_id] },
          campaign: campaign
        campaign_assessment.update!(assessor_form_id: params[:assessor_form_id])
        render json: {
          assessor_form_name: campaign_assessment.assessor_form&.name,
          assessor_form_id: campaign_assessment.assessor_form&.id
        }
      end

      def update_available_locales
        audit! :update_available_locales, campaign_assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment.id }
        campaign_assessment.update!(available_locales: params[:available_locales] || [])
        render json: {
          available_locales: campaign_assessment.available_locales
        }
      end

      def update_prework
        campaign_assessment.update_prework(params[:prework], params[:apply_to_existing_users])
        audit! :update_prework, campaign_assessment, campaign: campaign,
               payload: { campaign_id: campaign.id, campaign_assessment_id: campaign_assessment.id }
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
          audit! :update_workshop_activity, campaign_assessment, user: current_user,
            payload: { project_id: campaign.project_id, campaign_id: campaign.id },
            campaign: campaign
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

      def update_content_variation
        campaign_assessment.update_content_variation!(params[:external_config],
                                                      params[:apply])

        audit! :update_content_variation, assessment, campaign: campaign

        render json: { content_variation_id: campaign_assessment.external_config['content_variation_id'] }
      end

      def update_pearson_variation
        campaign_assessment.update_pearson_variation!(params[:external_config], params[:apply])

        audit! :update_pearson_variation, assessment, campaign: campaign

        render json: { variation: campaign_assessment.external_config['variation'] }
      end

      def update_mhs_leadership_bar
        campaign_assessment.update_mhs_leadership_bar!(params[:leadership_bar], params[:apply])

        audit! :update_mhs_leadership_bar, assessment, campaign: campaign

        render json: { leadership_bar: campaign_assessment.external_config['leadership_bar'] }
      end

      def update_mhs_confidence_interval
        campaign_assessment.update_mhs_confidence_interval!(params[:confidence_interval], params[:apply])

        audit! :update_mhs_confidence_interval, assessment, campaign: campaign

        render json: { confidence_interval: campaign_assessment.external_config['confidence_interval'] }
      end

      def update_mhs_norm_region
        campaign_assessment.update_mhs_norm_region!(params[:norm_region], params[:apply])

        audit! :update_mhs_norm_region, assessment, campaign: campaign

        render json: { norm_region: campaign_assessment.external_config['norm_region'] }
      end

      def update_mhs_norm_option
        campaign_assessment.update_mhs_norm_option!(params[:norm_option], params[:apply])

        audit! :update_mhs_norm_option, assessment, campaign: campaign

        render json: { norm_option: campaign_assessment.external_config['norm_option'] }
      end

      def toggle_caching
        campaign_assessment.update!(caching_enabled: params[:caching_enabled])

        audit! :toggle_caching, campaign_assessment, payload: { caching_enabled: campaign_assessment.caching_enabled? },
               campaign: campaign

        render json: Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
      end

      def update_proctoring_settings
        if params[:proctoring_enabled] && !assessment.fixed_timed?
          error_msg = I18n.t('admin.proctoring_errors_timed_only')
          return render json: { errors: error_msg }, status: :unprocessable_entity
        end

        campaign_assessment.update!(
          proctoring_enabled: params[:proctoring_enabled]
        )

        audit! :update_proctoring_settings, campaign_assessment,
               payload: { proctoring_enabled: campaign_assessment.proctoring_enabled? },
               campaign: campaign

        render json: Administration::CampaignAssessmentSerializer.new(
          context: {
            current_user: current_user,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        ).serialize(campaign_assessment)
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

      def include_inactive_users
        params[:include_inactive_users]&.to_s == 'true'
      end
    end
  end
end
