# frozen_string_literal: true

module Api
  module Administration
    class RegistrationSettingPolicy < ::Administration::BasePolicy
      def index?
        manage_registration_settings?
      end

      def update?
        manage_registration_settings?
      end

      private

      def manage_registration_settings?
        has_permission?(:registration_settings, :manage)
      end
    end
  end
end
