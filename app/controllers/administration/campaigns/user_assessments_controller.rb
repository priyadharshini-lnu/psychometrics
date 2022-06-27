# frozen_string_literal: true

module Administration
  module Campaigns
    class UserAssessmentsController < Administration::Projects::BaseController
      before_action :set_resource
      before_action :pundit_authorize

      def update_norm
        user_result = resource.users_result
        options = { norm_id: params[:norm_id], fixed_norm: true }
        ::UsersResults::Recompute.call!(user_result, current_user, options)

        render json: { norm_name: resource.norm_name }
      end

      def update_additional_time
        ::UsersResults::AddAdditionalTime.call!(resource.users_result, params[:additional_time] * 60)

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      def destroy
        resource.destroy!

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      def rescore_response
        user_result = resource.users_result
        AdminJob.call(:rescore_user_assessment, {
          user_result_id: user_result.id,
          campaign_id: campaign.id
        }, current_user)

        render json: :ok
      end

      def reset
        ::UsersResults::Reset.call(resource) do
          on(:ok) do
            return render json: resource.user, serializer: Administration::UserDetailSerializer,
              campaign: resource.campaign
          end
          on(:error) do |error|
            return render json: { errors: error }, status: 422
          end
        end
      end

      def reset_progress
        ::UserAssessments::ResetProgress.call!(resource)

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id
        )
      end

      def assessment
        resource
      end

      def resource_class
        UserAssessment
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:id])
      end
    end
  end
end
