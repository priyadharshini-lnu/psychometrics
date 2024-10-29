# frozen_string_literal: true

module Api
  module Administration
    class ClientPrivacySettingPolicy < BasePolicy
      def index?
        manage_privacy_setting?
      end

      def update?
        manage_privacy_setting?
      end

      private

      def manage_privacy_setting?
        has_permission?(:project_settings, :privacy_settings, project_id: project_id)
      end
    end
  end
end
