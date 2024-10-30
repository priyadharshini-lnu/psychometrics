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
        user.is?(:superadmin)
      end
    end
  end
end
