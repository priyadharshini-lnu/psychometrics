# frozen_string_literal: true

module Administration
  module Campaigns
    class CurrentUserSerializer < ActiveModel::Serializer
      attributes :id, :grants, :role, :permissions

      def grants
        instance_options[:current_membership]&.grants&.data || {}
      end

      def permissions
        permissions = GetPermissionsHash.call!(
          Administration::CampaignPolicy,
          object,
          nil,
          [
            'create',
            'manage_admins',
            'manage_campaign_admins',
            %w[manage_options update_campaign_options],
            'manage_campaigns',
            'view_registration_codes',
            'view_datasheets',
            'manage_project_smtp_settings'
          ],
          {
            project_id: instance_options[:project_id],
            campaign_id: instance_options[:campaign_id]
          }
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end
    end
  end
end
