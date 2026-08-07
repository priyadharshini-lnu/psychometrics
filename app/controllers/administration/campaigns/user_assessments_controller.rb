# frozen_string_literal: true

module Administration
  module Campaigns
    class UserAssessmentsController < Administration::Campaigns::BaseController
      before_action :set_resource
      before_action :pundit_authorize

      def update_norm
        user_result = resource.users_result
        resource.update_norm!(params[:norm_id])
        ::UsersResults::Recompute.call!(user_result, current_user)

        audit! :update_norm, resource, payload: { norm_id: params[:norm_id] }, campaign: resource.campaign

        render json: { norm_name: resource.norm_name }
      end

      def mark_complete
        resource.update!(status: :completed, completed_at: Time.current)

        audit! :mark_complete, resource, campaign: resource.campaign

        render json: Administration::UserAssessmentSerializer.new(
          context: {
            current_user: current_user,
            campaign: resource.campaign
          }
        ).serialize(resource)
      end

      def update_mettl_schedule
        resource.update_mettl_schedule!(params[:mettl_schedule_record_id])

        audit! :update_mettl_schedule, resource, campaign: resource.campaign

        render json: { mettl_schedule_name: resource.mettl_user_assessment.schedule_name }
      end

      def update_content_variation
        resource.update_content_variation!(params[:content_variation_id])

        audit! :update_content_variation, resource, campaign: resource.campaign

        render json: { content_variation_id: resource.simulation_user_assessment.content_variation_id }
      end

      def update_simulation_time_extension
        resource.simulation_user_assessment.update!(time_extension: params[:time_extension])

        audit! :update_simulation_time_extension, resource, campaign: resource.campaign

        render json: { time_extension: resource.simulation_user_assessment.time_extension }
      end

      def update_mhs_confidence_interval
        resource.update_mhs_confidence_interval!(params[:assessment][:confidence_interval])

        audit! :update_mhs_confidence_interval, resource, campaign: resource.campaign

        render json: { confidence_interval: resource.mhs_user_assessment.confidence_interval }
      end

      def update_mhs_leadership_bar
        resource.update_mhs_leadership_bar!(params[:assessment][:leadership_bar])

        audit! :update_mhs_leadership_bar, resource, campaign: resource.campaign

        render json: { leadership_bar: resource.mhs_user_assessment.leadership_bar }
      end

      def update_mhs_norm_region
        resource.update_mhs_norm_region!(params[:assessment][:norm_region])

        audit! :update_mhs_norm_region, resource, campaign: resource.campaign

        render json: { norm_region: resource.mhs_user_assessment.norm_region }
      end

      def update_mhs_norm_option
        resource.update_mhs_norm_option!(params[:assessment][:norm_option])

        audit! :update_mhs_norm_option, resource, campaign: resource.campaign

        render json: { norm_option: resource.mhs_user_assessment.norm_option }
      end

      def webhook_command
        @webhook_command ||= UserAssessments::Webhook.new(resource, params[:webhook_id])
      end

      def webhook_payload
        data = case params['event_name']
                 when 'assessment_started'
                   webhook_command.assessment_started_data
                 when 'assessment_completed'
                   webhook_command.assessment_completed_data
                 when 'assessment_timeout'
                   webhook_command.publish_assessment_timeout
                 when 'assessment_raw_response'
                   webhook_command.assessment_raw_response_data
               end

        event_payload = Webhook::EVENTS[params['event_name'].to_sym].call(
          data.merge(project: resource.project, client: resource.project.parent)
        )
        render json: event_payload.as_json
      end

      def update_additional_time
        ::UsersResults::AddAdditionalTime.call!(resource.users_result, params[:additional_time] * 60)

        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: resource.campaign,
            current_user: current_user
          }
        ).serialize(resource.user)
      end

      def destroy
        resource.destroy!
        audit! :delete, resource, payload: resource.log_attributes, campaign: resource.campaign

        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: resource.campaign,
            current_user: current_user
          }
        ).serialize(resource.user)
      end

      def rescore_response
        user_result = resource.users_result
        AdminJob.call(:rescore_user_assessment, {
          user_result_id: user_result.id,
          allow_ai_rescore: params[:allow_ai_rescore].to_s == 'true',
          campaign_id: campaign.id
        }, current_user)
        audit! :rescore_results, resource, campaign: resource.campaign
        render json: :ok
      end

      def reset
        ::UsersResults::Reset.call(resource) do
          on(:ok) do
            audit! :reset, resource, campaign: resource.campaign
            return render json: Administration::UserDetailSerializer.new(
              context: {
                campaign: resource.campaign,
                current_user: current_user
              }
            ).serialize(resource.subject)
          end
          on(:error) do |error|
            return render json: { errors: error }, status: 422
          end
        end
      end

      def reset_progress
        ::UserAssessments::ResetProgress.call!(resource, reset_flag: true)
        audit! :reset_progress, resource, campaign: resource.campaign

        render json: Administration::UserDetailSerializer.new(
          context: {
            campaign: resource.campaign,
            current_user: current_user
          }
        ).serialize(resource.subject)
      end

      def normalize_factor_scores
        UserAssessments::NormalizeFactorScores.call!(resource) do
          on(:ok) do
            audit! :normalize_factor_scores, resource, campaign: resource.campaign
            return render json: :ok
          end
          on(:no_scoring_data) do
            return render json: {
              errors: [I18n.t('user_assessments.normalize_factor_scores.no_scoring_data')]
            }, status: 422
          end
        end
      end

      def toggle_require_scheduling
        attrs = { require_scheduling: params[:require_scheduling] }
        attrs[:schedule_time] = nil unless params[:require_scheduling]
        resource.update!(attrs)

        render json: Administration::UserAssessmentSerializer.new(
          context: {
            current_user: current_user,
            campaign: resource.campaign
          }
        ).serialize(resource)
      end

      def toggle_prework
        resource.update!(prework: params[:prework])
        audit! :toggle_prework, resource, user: current_user, campaign: resource.campaign,
          payload: { prework: params[:prework] }
        render json: Administration::UserAssessmentSerializer.new(
          context: {
            current_user: current_user,
            campaign: resource.campaign
          }
        ).serialize(resource)
      end

      def schedule_assessment
        resource.update!(schedule_time: params[:schedule_time])

        render json: Administration::UserAssessmentSerializer.new(
          context: {
            current_user: current_user,
            campaign: resource.campaign
          }
        ).serialize(resource)
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def webhook
        Webhook.find(params[:webhook_id])
      end

      def resource_class
        UserAssessment
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.user_assessments.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end
