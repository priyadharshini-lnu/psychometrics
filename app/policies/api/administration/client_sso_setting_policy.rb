# frozen_string_literal: true

module Api
  module Administration
    class ClientSsoSettingPolicy < BasePolicy
      def index?
        manage_sso_setting?
      end

      def update?
        manage_sso_setting?
      end

      def parse_metadata?
        manage_sso_setting?
      end

      private

      def manage_sso_setting?
        user.is?(:superadmin)
      end
    end
  end
end
