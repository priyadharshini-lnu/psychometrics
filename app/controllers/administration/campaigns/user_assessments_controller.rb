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

        render json: { norm_name: resource.norm_name }
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
               end

        event_payload = Webhook::EVENTS[params['event_name'].to_sym].call(
          data.merge(project: resource.project, client: resource.project.parent)
        )
        render json: event_payload.as_json
      end

      def update_additional_time
        ::UsersResults::AddAdditionalTime.call!(resource.users_result, params[:additional_time] * 60)

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      def destroy
        resource.destroy!
        audit! :delete, resource, payload: resource.log_attributes, campaign: resource.campaign

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      def rescore_response
        user_result = resource.users_result
        AdminJob.call(:rescore_user_assessment, {
          user_result_id: user_result.id,
          campaign_id: campaign.id
        }, current_user)
        audit! :rescore_results, resource, campaign: resource.campaign
        render json: :ok
      end

      def reset
        ::UsersResults::Reset.call(resource) do
          on(:ok) do
            audit! :reset, resource, campaign: resource.campaign
            return render json: resource.user, serializer: Administration::UserDetailSerializer,
                          campaign: resource.campaign
          end
          on(:error) do |error|
            return render json: { errors: error }, status: 422
          end
        end
      end

      def reset_progress
        ::UserAssessments::ResetProgress.call!(resource, reset_flag: true)
        audit! :reset_progress, resource, campaign: resource.campaign

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      def toggle_require_scheduling
        attrs = { require_scheduling: params[:require_scheduling] }
        attrs[:schedule_time] = nil unless params[:require_scheduling]
        resource.update!(attrs)

        render json: resource, serializer: Administration::UserAssessmentSerializer, campaign: resource.campaign
      end

      def schedule_assessment
        resource.update!(schedule_time: params[:schedule_time])

        render json: resource, serializer: Administration::UserAssessmentSerializer, campaign: resource.campaign
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
