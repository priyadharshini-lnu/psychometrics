# frozen_string_literal: true

module CampaignInitialState
  extend ActiveSupport::Concern

  included do
    def self.initial_state_for(actions)
      before_action :set_init_state, only: Array.wrap(actions), if: -> { request.format.html? }
    end
  end

  def set_init_state
    current_membership = current_user.memberships.find do |m|
      (m.project_admin? && m.client_id == project.id) || (m.client_admin? && m.client_id == project.parent_id)
    end
    @init_state = {
      currentUser: ::Administration::Campaigns::CurrentUserSerializer.
                  new(current_user, current_membership: current_membership).
                  to_h
    }
  end
end
