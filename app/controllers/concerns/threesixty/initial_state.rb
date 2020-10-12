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
      },
      config: {
        isFrame: use_iframe?,
        agileAssetsUrl: Settings.agile_config.asset_url
      },
      currentUser: serialized_current_user,
      liveChat: {
        url: Settings.live_chat.base_url,
        token: Settings.live_chat.token,
        enabled: @current_project.enable_live_chat
      }
    }
  end

  def serialized_current_user
    ::Threesixty::CurrentUserSerializer.new(current_user).
      as_json.
      deep_transform_keys! { |key| key.to_s.camelize(:lower) }
  end
end
