# frozen_string_literal: true

module Administration
  module Campaigns
    class CurrentUserSerializer < Panko::Serializer
      # Mirrors Api::V2::Administration::CurrentUserResource minus sign_in_notice, which must stay one-shot.
      attributes :id, :grants, :role, :role_title, :permissions, :name, :client_admin_client_ids,
                 :library_owner_field_visible, :support_admin, :email, :first_name, :last_name,
                 :photo, :preferences

      # The delegate, not user_profile.photo: init_state runs on every admin page and a missing profile must not raise.
      def photo
        object.photo&.url
      end

      def preferences
        object.user_preferences.map { |preference| preference.slice(:category, :config_key, :payload) }
      end

      def support_admin
        object.support_admin?
      end

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
        permissions['access_reflection_questions'] = Api::Administration::ReflectionQuestionPolicy.new(
          object, ReflectionQuestion, project_id: context[:project_id]
        ).index?
        permissions['access_interview_questions'] = Api::Administration::InterviewQuestionPolicy.new(
          object, InterviewQuestion, project_id: context[:project_id]
        ).index?
        permissions['manage_idp_project_settings'] = Api::Administration::IdpSettingPolicy.new(
          object, IdpSetting, project_id: context[:project_id]
        ).update?
        permissions['manageProjectFeatureFlags'] = Api::Administration::ProjectFeaturePolicy.new(
          object, ProjectFeature, project_id: context[:project_id]
        ).index?
        permissions['viewDatasheets'] = Administration::DatasheetPolicy.new(
          object, Datasheet, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).index?
        permissions['manageDatasheets'] = Administration::DatasheetPolicy.new(
          object, Datasheet, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).manage?
        permissions['viewProjectLicenses'] = Api::Administration::Projects::LicensePolicy.new(
          object, ProjectLicense, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).index?
        permissions['manageProjectLicenses'] = Api::Administration::Projects::LicensePolicy.new(
          object, ProjectLicense, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).create?
        permissions['export_completion_status'] = Api::Administration::ProjectPolicy.new(
          object, Project, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).export_completion_status?
        permissions['export_compact_completion_status'] = Api::Administration::ProjectPolicy.new(
          object, Project, project_id: context[:project_id], campaign_id: context[:campaign_id]
        ).export_completion_status?
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end

      def current_user
        object
      end

      def client_admin_client_ids
        object.client_admin_client_ids.map(&:to_s)
      end

      def library_owner_field_visible
        return true if object.is?(:superadmin)
        return false unless object.is?(:client_admin)

        client_admin_client_ids.length > 1
      end
    end
  end
end
