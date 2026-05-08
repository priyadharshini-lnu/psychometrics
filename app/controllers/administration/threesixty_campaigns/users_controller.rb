# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class UsersController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource
      append_before_action :pundit_authorize

      def update
        if form.valid?
          resource.update!(form.attributes.except(:current_job_role, :target_job_role))
          audit! :update, resource, payload: form.attributes, campaign: threesixty_campaign.campaign
          update_campaign_user_job_roles if job_roles_present?

          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      private

      def set_resource_class
        @_resource_class ||= User # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = threesixty_campaign.campaign.users.find(params[:id])
      end

      def form
        @form ||= if current_user.superadmin?
                    ::Users::SuperAdminEditForm
                  else
                    ::Users::AdminEditForm
                  end.from_params(params[:user])
      end

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          threesixty_campaign: threesixty_campaign,
          project_id: params[:project_id] || threesixty_campaign&.campaign&.project_id,
          policy_class: Threesixty::UserPolicy
        )
      end

      def job_roles_present?
        form.attributes.key?(:current_job_role) || form.attributes.key?(:target_job_role)
      end

      def update_campaign_user_job_roles
        campaign_user = CampaignUser.find_or_create_by!(
          user: resource,
          campaign: threesixty_campaign.campaign
        )

        campaign_user.update!(
          current_job_role_id: form.current_job_role,
          target_job_role_id: form.target_job_role
        )
      end
    end
  end
end
