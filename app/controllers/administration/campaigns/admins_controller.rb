# frozen_string_literal: true

module Administration
  module Campaigns
    class AdminsController < Administration::Projects::BaseController
      include Administration::MembershipManagement

      private

      def default_grants
        User::DEFAULT_CAMPAIGN_ADMIN_GRANTS
      end

      def role
        Membership::CAMPAIGN_ADMIN_ROLE
      end

      def admins
        campaign.memberships.where(
          role: Membership::CAMPAIGN_ADMIN_ROLE
        ).includes(user: %i[campaigns memberships]).ransack(params[:filters]).result
      end

      def set_resource
        @_resource = policy_scope(
          Membership, policy_scope_class: Administration::Campaigns::AdminPolicy::Scope
        ).find(params[:id])
      end

      def policy_class_name
        Administration::Campaigns::AdminPolicy
      end

      def project_id
        campaign.project_id
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::AdminPolicy,
          current_user,
          nil,
          %w[create],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end
    end
  end
end
