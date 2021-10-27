# frozen_string_literal: true

module Threesixty::InitialState
  extend ActiveSupport::Concern

  included do
    def self.initial_state_for(actions)
      before_action :set_init_state, only: Array.wrap(actions), if: -> { request.format.html? }
    end
  end

  def set_init_state
    @current_project ||= GetProjectBySubdomain.call!(request.subdomain)

    @init_state = {
      campaigns: {
        project: {
          name: @current_project.name,
          logo: @current_project.logo.url,
          secondaryLogo: @current_project.secondary_logo.url,
          privacyText: @current_project.privacy_link&.text,
          privacyPageLink: @current_project.privacy_link&.link
        }
      }.merge(campaign_intial_state),
      config: {
        agileAssetsUrl: Settings.agile_config.asset_url,
        features: feature_flags,
        maintenance: {
          remainingTime: remaining_maintenance_time
        }
      },
      currentUser: serialized_current_user,
      liveChat: {
        url: Settings.live_chat.base_url,
        token: live_chat_token,
        enabled: @current_project.enable_live_chat
      }
    }
  end

  def live_chat_token
    @current_project.live_chat_token.blank? ? Settings.live_chat.token : @current_project.live_chat_token
  end

  def serialized_current_user
    ::Threesixty::CurrentUserSerializer.new(current_user, project_id: @current_project.id).
      as_json.
      deep_transform_keys! { |key| key.to_s.camelize(:lower) }
  end

  def campaign_intial_state
    {}
  end

  def remaining_maintenance_time
    (ENV['MAINTENANCE_START_DATETME'].to_time - Time.now).to_i if ENV['MAINTENANCE_START_DATETME']
  end
end
