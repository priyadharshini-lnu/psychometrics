# frozen_string_literal: true

module Api
  module Administration
    class IdpSettingPolicy < ::Administration::BasePolicy
      def index?
        manage_idp_settings?
      end

      def update?
        manage_idp_settings?
      end

      private

      def manage_idp_settings?
        has_permission?(:project_settings, :idp)
      end
    end
  end
end
