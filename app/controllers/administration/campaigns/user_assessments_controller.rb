# frozen_string_literal: true

module Administration
  module Campaigns
    class UserAssessmentsController < Administration::Projects::BaseController
      before_action :set_resource
      before_action :pundit_authorize

      def update_norm
        user_result = resource.users_result

        ::UsersResults::Recompute.call!(user_result, 'id' => params[:norm_id], 'type' => params[:norm_type])
        ::UsersResults::RegenerateReports.call!(user_result, campaign, current_user)

        user_result.update!(norm_id: params[:norm_id], norm_type: params[:norm_type])

        render json: { norm_name: user_result.norm.name, norm_type: user_result.norm_type }
      end

      def update_additional_time
        ::UsersResults::AddAdditionalTime.call!(resource.users_result, params[:additional_time] * 60)
        render json: resource, serializer: UserAssessmentSerializer
      end

      def rescore_response
        user_result = resource.users_result

        ::UsersResults::Recompute.call!(user_result)
        ::UsersResults::RegenerateReports.call!(user_result, campaign, current_user)

        render json: :ok
      end

      private

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
