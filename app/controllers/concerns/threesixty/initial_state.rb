# frozen_string_literal: true

module Threesixty::InitialState
  extend ActiveSupport::Concern

  included do
    def self.initial_state_for(actions)
      before_action :set_init_state, only: Array.wrap(actions), if: -> { request.format.html? }
    end
  end

  def set_init_state # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/AbcSize
    @current_project ||= GetProjectBySubdomain.call!(request.subdomain)

    @init_state = {
      campaigns: {
        project: {
          name: @current_project.name,
          logo: @current_project.design_setting.logo&.url,
          secondaryLogo: @current_project.design_setting.secondary_logo&.url,
          privacyText: @current_project.privacy_setting.privacy_link_text,
          privacyPageLink: @current_project.privacy_setting.privacy_link_url
        }
      }.merge(campaign_intial_state),
      config: {
        design: {
          logo: @current_project.design_setting.logo&.url,
          secondary_logo: @current_project.design_setting.secondary_logo&.url,
          primary_color: @current_project.design_setting.primary_color,
          error_color: @current_project.design_setting.error_color,
          warning_color: @current_project.design_setting.warning_color,
          success_color: @current_project.design_setting.success_color,
          info_color: @current_project.design_setting.info_color
        },
        profile: {
          fields: @current_project.profile_setting&.profile_fields&.includes(:question)&.map do |q|
            ProfileFieldSerializer.new(q, selected_locale: I18n.locale).to_h
          end,
          requiredFields: @current_project.profile_setting&.required_default_fields || {},
          lockedFields: @current_project.profile_setting&.locked_default_fields || {},
          enabledFields: @current_project.profile_setting&.enabled_default_fields || {}
        },
        agileAssetsUrl: Settings.agile_config.asset_url,
        features: feature_flags,
        maintenance: {
          remainingTime: remaining_maintenance_time
        },
        lighthousePrivacyUrl: Settings.privacy_url,
        privacyPolicyVersion: @current_project.current_privacy_policy_version,
        customPrivacyConsentText: custom_privacy_consent_text,
        showBookings: show_bookings?
      },
      currentUser: serialized_current_user,
      liveChat: {
        url: Settings.live_chat.base_url,
        token: live_chat_token,
        enabled: @current_project.enable_live_chat
      }
    }
  end

  def show_bookings?
    WorkshopInvitedSubject.where(user: current_user).any?
  end

  def custom_privacy_consent_text
    return unless @current_project.privacy_setting.custom_privacy_consent

    @current_project.privacy_setting.custom_privacy_consent_text
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
end
