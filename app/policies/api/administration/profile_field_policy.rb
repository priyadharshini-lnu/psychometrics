# frozen_string_literal: true

module Api
  module Administration
    class ProfileFieldPolicy < ::Administration::BasePolicy
      def index?
        manage_profile_settings?
      end

      def update?
        manage_profile_settings?
      end

      private

      def manage_profile_settings?
        has_permission?(:project_settings, :profile)
      end
    end
  end
end
