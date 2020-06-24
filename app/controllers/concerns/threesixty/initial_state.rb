# frozen_string_literal: true

module Threesixty::InitialState
  extend ActiveSupport::Concern

  included do
    def self.initial_state_for(actions)
      before_action :set_init_state, only: Array.wrap(actions), if: -> { request.format.html? }
    end
  end

  def set_init_state
    @init_state = {
      threeSixtyCampaign: {
        temp: {
          project: {
            logo: @current_project.logo.url,
            privacyText: @current_project.privacy_link&.text,
            privacyPageLink: @current_project.privacy_link&.link
          },
          currentUser: serialized_current_user
        }
      },
      extras: {
        isFrame: use_iframe?
      }
    }
  end

  def serialized_current_user
    ::Threesixty::CurrentUserSerializer.new(current_user).
      as_json.
      deep_transform_keys! { |key| key.to_s.camelize(:lower) }
  end
end
