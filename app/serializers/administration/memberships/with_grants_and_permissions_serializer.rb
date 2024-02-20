# frozen_string_literal: true

module Administration
  module Memberships
    class WithGrantsAndPermissionsSerializer < BaseSerializer
      attributes :permissions, :campaigns

      has_one :grants, serializer: MembershipGrantsSerializer

      def permissions
        permissions = GetPermissionsHash.call!(
          Administration::Campaigns::AdminPolicy,
          current_user,
          object,
          [
            %w[login_as spoof],
            'edit',
            %w[remove destroy],
            'reset_password',
            'send_mail'
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end

      def campaigns
        object.user.memberships.campaign_admin_role.includes(:campaign).map do |membership|
          { id: membership.campaign_id, name: membership.campaign.name }
        end
      end
    end
  end
end
