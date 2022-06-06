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
          Administration::ProjectPolicy,
          object,
          nil,
          %w[
            manage_project_admins
            manage_project_smtp_settings
          ],
          {
            project_id: instance_options[:project_id],
            campaign_id: instance_options[:campaign_id]
          }
        )
        permissions['manage_project_saml_setting'] = Administration::SamlSettingPolicy.new(
          object, SamlSetting, project_id: instance_options[:project_id], campaign_id: instance_options[:campaign_id]
        ).update?
        permissions['manage_project_integrations'] = Administration::IntegrationPolicy.new(
          object, Integration, project_id: instance_options[:project_id], campaign_id: instance_options[:campaign_id]
        ).update?
        permissions['manage_project_security_settings'] = Administration::SecuritySettingPolicy.new(
          object, SecuritySetting, project_id: instance_options[:project_id],
          campaign_id: instance_options[:campaign_id]
        ).update?
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end
    end
  end
end
