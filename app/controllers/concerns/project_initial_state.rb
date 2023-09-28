# frozen_string_literal: true

module ProjectInitialState
  extend ActiveSupport::Concern

  def set_project_init_state
    current_membership = current_user.memberships.find do |m|
      (m.project_admin? && m.client_id == project.id) || (m.client_admin? && m.client_id == project.parent_id)
    end
    @init_state ||= {}
    @init_state.merge!({
      currentUser: ::Administration::Campaigns::CurrentUserSerializer.
                  new(
                    current_user,
                    current_membership: current_membership,
                    project_id: project.id,
                    campaign_id: @campaign&.id
                  ).
                  to_h,
      project: {
        smtpSetting: ActiveModelSerializers::SerializableResource.new(
          project.smtp_setting, {
            key_transform: :camel_lower, serializer: ::Administration::Projects::SmtpSettingSerializer
          }
        ).as_json,
        samlSetting: ActiveModelSerializers::SerializableResource.new(
          project.saml_setting, {
            key_transform: :camel_lower, serializer: ::Administration::Projects::SamlSettingSerializer
          }
        ).as_json,
        securitySetting: ActiveModelSerializers::SerializableResource.new(
          project.security_setting, {
            key_transform: :camel_lower, serializer: ::Administration::Projects::SecuritySettingSerializer
          }
        ).as_json
      },
      config: {
        availableLocales: I18n.available_locales,
        features: feature_flags,
        isProjectMigrated: project.migrated?
      }
    })
  end
end
