# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class UserPolicy < ::Administration::UserPolicy
        def index?
          has_permission?(:workshops, :manage) || has_permission?(:campaigns, :manage_users)
        end
      end
    end
  end
end
