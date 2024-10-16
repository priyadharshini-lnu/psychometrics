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
                    context: {
                      current_membership: current_membership,
                      project_id: project.id,
                      campaign_id: @campaign&.id
                    }
                  ).serialize(current_user),
      project: {
        smtpSetting: ::Administration::Projects::SmtpSettingSerializer.new(
          context: {
            key_transform: :camel_lower
          }
        ).serialize(project.smtp_setting),
        samlSetting: ::Administration::Projects::SamlSettingSerializer.new(
          context: {
            key_transform: :camel_lower
          }
        ).serialize(project.saml_setting),
        securitySetting: ::Administration::Projects::SecuritySettingSerializer.new(
          context: {
            key_transform: :camel_lower
          }
        ).serialize(project.security_setting),
        clientId: project.client.id
      },
      config: {
        availableLocales: I18n.available_locales,
        features: feature_flags,
        timezone: ActiveSupport::TimeZone::MAPPING[Time.zone.name]
      }
    })
  end
end
