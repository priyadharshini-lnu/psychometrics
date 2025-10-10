# frozen_string_literal: true

module Administration
  module Campaigns
    class CurrentUserSerializer < Panko::Serializer
      attributes :id, :grants, :role, :role_title, :permissions, :name

      def grants
        context[:current_membership]&.grants&.data || {}
      end

      def role_title
        object.decorate.role
      end

      def permissions # rubocop:disable Metrics/AbcSize
        permissions = GetPermissionsHash.call!(
          Administration::ProjectPolicy,
          object,
          nil,
          [
            'can_manage_project',
            'manage_project_admins',
            'manage_project_smtp_settings',
            'manage_project_webhooks',
            %w[manage_project_general_settings update],
            'manage_project_privacy_setting',
            'manage_project_assessments',
            'view_audit_reports',
            'access_project_taxonomy'
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
        permissions['manage_project_saml_setting'] = Administration::SamlSettingPolicy.new(
          object, SamlSetting, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).update?
        permissions['manage_project_integrations'] = Administration::IntegrationPolicy.new(
          object, Integration, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).update?
        permissions['manage_project_security_settings'] = Administration::SecuritySettingPolicy.new(
          object, SecuritySetting, project_id: context[:project_id],
          campaign_id: context[:campaign_id]
        ).update?
        permissions['manage_design_settings'] = Administration::ClientPolicy.new(
          object, DesignSetting, project_id: context[:project_id]
        ).design?
        permissions['manage_profile_settings'] = Administration::ClientPolicy.new(
          object, ProfileSetting, project_id: context[:project_id]
        ).profile?
        permissions['workshop_status_export'] = Api::Administration::ProjectPolicy.new(
          object, Project, project_id: context[:project_id]
        ).workshop_status_export?
        permissions['access_project_development_actions'] = Api::Administration::DevelopmentActionPolicy.new(
          object, DevelopmentAction, project_id: context[:project_id]
        ).index?
        permissions['access_idp_templates'] = Api::Administration::IdpTemplatePolicy.new(
          object, IdpTemplate, project_id: context[:project_id]
        ).index?
        permissions['accessReflectionQuestions'] = Api::Administration::ReflectionQuestionPolicy.new(
          object, ReflectionQuestion, project_id: context[:project_id]
        ).index?
        permissions['manageProjectFeatureFlags'] = Api::Administration::ProjectFeaturePolicy.new(
          object, ProjectFeature, project_id: context[:project_id]
        ).index?
        permissions['viewDatasheets'] = Administration::DatasheetPolicy.new(
          object, Datasheet, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).index?
        permissions['manageDatasheets'] = Administration::DatasheetPolicy.new(
          object, Datasheet, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).manage?
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end

      def current_user
        object
      end
    end
  end
end
