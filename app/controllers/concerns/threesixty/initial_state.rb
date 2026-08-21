# frozen_string_literal: true

module Threesixty::InitialState
  extend ActiveSupport::Concern

  included do
    def self.initial_state_for(actions)
      before_action :set_init_state, only: Array.wrap(actions), if: -> { request.format.html? }
    end
  end

  # rubocop:disable Metrics/AbcSize
  # rubocop:disable Metrics/CyclomaticComplexity
  # rubocop:disable Metrics/PerceivedComplexity
  def set_init_state
    @current_project ||= GetProjectBySubdomain.call!(request.subdomain)
    @idp_setting ||= @current_project.idp_setting
    @init_state = {
      campaigns: {
        project: {
          name: @current_project.name,
          logo: @current_project.design_setting.logo_url,
          secondaryLogo: @current_project.design_setting.secondary_logo_url,
          privacyText: @current_project.privacy_setting.privacy_link_text,
          enablePrivacyLink: @current_project.privacy_setting.enable_privacy_link,
          privacyPageLink: @current_project.privacy_setting.privacy_link_url
        }
      }.merge(campaign_intial_state),
      config: {
        design: {
          logo: @current_project.design_setting.logo_url,
          secondary_logo: @current_project.design_setting.secondary_logo_url,
          primary_color: @current_project.design_setting.primary_color,
          error_color: @current_project.design_setting.error_color,
          warning_color: @current_project.design_setting.warning_color,
          success_color: @current_project.design_setting.success_color,
          info_color: @current_project.design_setting.info_color,
          secondary_logo_alt_text: @current_project.design_setting.secondary_logo_alt_text,
          logo_alt_text: @current_project.design_setting.logo_alt_text
        },
        profile: {
          fields: Panko::ArraySerializer.new(
            @current_project.profile_setting&.profile_fields&.includes(:question),
            each_serializer: ProfileFieldSerializer,
            context: {
              selected_locale: I18n.locale
            }
          ).to_a,
          requiredFields: @current_project.profile_setting&.required_default_fields || {},
          lockedFields: @current_project.profile_setting&.locked_default_fields || {},
          enabledFields: @current_project.profile_setting&.enabled_default_fields || {}
        },
        agileAssetsUrl: Settings.agile_config.asset_url,
        features: feature_flags,
        lighthousePrivacyUrl: Settings.privacy_url,
        privacyPolicyVersion: @current_project.current_privacy_policy_version,
        customPrivacyConsentText: custom_privacy_consent_text,
        customPrivacyAcknowledgmentText: custom_privacy_acknowledgment_text,
        showBookings: show_bookings?,
        showMaintenanceAlert: helpers.show_maintenance_alert?,
        campaignDashboardInstructions: Mobility.with_locale(I18n.locale) do
          @current_project.campaign_dashboard_instructions
        end,
        idp: {
          managerApprovesIdp: @idp_setting&.manager_approves_idp || false,
          managerCanEditIdp: @idp_setting&.manager_can_edit_idp || false,
          requireAllDevelopmentActionsComplete: @idp_setting&.require_all_development_actions_complete || false,
          idpEnabled: @current_project.client.feature_enabled?(:idp) && @current_project.project_feature_enabled?(:idp),
          aiAssistants: @current_project.client.feature_enabled?(:ai_assistants) &&
                        @current_project.project_feature_enabled?(:ai_assistants),
          aiAssistedIdpFeatureEnabled: @current_project.project_feature_enabled?(:ai_assisted_idp),
          userHasActiveIdp: @current_user.active_user_idp_plan.present?,
          userHasDirectReporteesWithActiveIdp: current_user_has_direct_reportees_with_active_idp?,
          aiAssistedIdpHasDocumentAnalysis: ai_assisted_idp_has_document_analysis?
        },
        securitySettings: {
          enableRecaptcha: @current_project.security_setting.enable_recaptcha
        },
        glintUi: @current_project.project_feature_enabled?(:glint_ui)
      },
      currentUser: serialized_current_user,
      liveChat: {
        url: Settings.live_chat.base_url,
        token: live_chat_token,
        enabled: @current_project.enable_live_chat
      },
      maintenanceSettings: maintenance_settings
    }
  end

  def show_bookings?
    WorkshopInvitedSubject.where(user: current_user).any?
  end

  def custom_privacy_consent_text
    return unless @current_project.privacy_setting.custom_privacy_consent

    @current_project.privacy_setting.custom_privacy_consent_text
  end

  def custom_privacy_acknowledgment_text
    return unless @current_project.privacy_setting.custom_privacy_consent

    @current_project.privacy_setting.custom_privacy_acknowledgment_text
  end

  def live_chat_token
    @current_project.live_chat_token.presence || Settings.live_chat.token
  end

  def serialized_current_user
    serializer = ::EndUser::CurrentUserSerializer.new(
      context: { project_id: @current_project.id }
    )

    serializer.serialize(current_user).as_json.
      deep_transform_keys! { |key| key.to_s.camelize(:lower) }
  end

  def campaign_intial_state
    {}
  end

  def remaining_maintenance_time
    (ENV['MAINTENANCE_START_DATETIME'].to_time - Time.zone.now).to_i if ENV['MAINTENANCE_START_DATETIME']
  end

  private

  def current_user_has_direct_reportees_with_active_idp?
    @current_project.end_users.where(manager: @current_user).
      joins(:active_user_idp_plan).
      exists?
  end

  def ai_assisted_idp_has_document_analysis?
    @current_user.active_user_idp_plan&.idp_template&.document_analysis_ai_assistant_id.present?
  end

  def maintenance_settings
    settings = MaintenanceSetting.all
    return nil unless settings.any?

    Panko::ArraySerializer.new(
      settings,
      each_serializer: MaintenanceSettingsSerializer
    ).to_a.map { |setting| setting.deep_transform_keys { |key| key.to_s.camelize(:lower) } }
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/CyclomaticComplexity
# rubocop:enable Metrics/PerceivedComplexity
